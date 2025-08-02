import AppError from "../../errorHelper/AppError"
import { Encrypt } from "../../utils/encrypt"
import httpStatus from "http-status-codes"
import { Agent } from "./agent.model"
import { IAgent } from "./agent.interface"
import { IAuthProvider } from "../user/user.interface"
import { Wallet } from "../wallet/wallet.model"

// create user
const createAgentWithWallet = async (payload: Partial<IAgent>) =>{
    const { email, password, ...rest} = payload
    const isUserExist = await Agent.findOne({email})

    if (isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, "This Agent already exists")
    }

    // start agent model session
    const session = await Agent.startSession()

    try {

        // Start the transaction
        session.startTransaction()

        const hashedPassword = await Encrypt.hashPassword(password as string)    
        const authProvider: IAuthProvider = { provider: "credentials", providerId : email as string}
        
        // create new agent
        const agent = new Agent({
            email,
            password: hashedPassword,
            auths : authProvider,
            ...rest
        })

        // Saving the agent to the database within the session
        const createdAgent = await agent.save({session})

        // Create the wallet, linking it to the new agent
        const newWallet = await Wallet.create([{
            userId : createdAgent?._id,
            userModel : "agent"
        }], {session})

        //  Update the user with the new wallet's ID 
        createdAgent.walletId = newWallet[0]._id 
        await createdAgent.save({session})

        // commit the transaction
        await session.commitTransaction()

        return createdAgent
        
    } catch (error) {

        // If any error occurs, abort the entire transaction
        await session.abortTransaction();
        return { success: false, message: 'Failed to create user and wallet.', error }

    }finally{
      // Finally, always end the session
        session.endSession();
    }
}

export const AgentServices = {
    createAgentWithWallet,
}