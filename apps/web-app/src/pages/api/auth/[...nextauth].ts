import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from "../../../../firebase"

export const authOptions = {
    // Configure one or more authentication providers
    pages: {
        signIn: '/signin'
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {},
            async authorize(credentials): Promise<any> {
                return signInWithEmailAndPassword(auth, (credentials as any).email || '', (credentials as any).password)
                    .then(userCredential => {
                        if (userCredential.user) {
                            return userCredential.user;
                        }
                        return null;
                    }).catch(error => (console.log(error)))

            }
        }),
    ],
}

export default NextAuth(authOptions)