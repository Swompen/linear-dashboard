import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

// Parse staff role IDs from environment variable (comma-separated)
const STAFF_ROLE_IDS = (process.env.DISCORD_STAFF_ROLE_IDS || "").split(",").filter(Boolean);
const BOARD_ROLE_ID = process.env.DISCORD_BOARD_ROLE_ID || "";

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: { params: { scope: "identify guilds guilds.members.read" } }
    }),
  ],
  callbacks: {
    async signIn({ account, user }) {
      const guildId = process.env.DISCORD_GUILD_ID;
      const res = await fetch(
        `https://discord.com/api/v10/users/@me/guilds/${guildId}/member`,
        {
          headers: {
            Authorization: `Bearer ${account.access_token}`,
          },
        }
      );
      if (!res.ok) return false;
      const member = await res.json();
      user.roles = member.roles;
      // Ensure Discord ID is preserved (Discord provider sets user.id, but also store providerAccountId)
      if (account?.providerAccountId && !user.id) {
        user.id = account.providerAccountId;
      }
      return member.roles.includes(BOARD_ROLE_ID) || member.roles.some(role => STAFF_ROLE_IDS.includes(role));
    },
    async jwt({ token, user, account }) {
      // Attach roles and user ID to JWT token
      if (user?.roles) {
        token.roles = user.roles;
      }
      // Discord provider sets user.id to the Discord user ID
      // Prioritize user.id, then account.providerAccountId
      if (user?.id) {
        token.userId = user.id;
      } else if (account?.providerAccountId) {
        token.userId = account.providerAccountId;
      }
      return token;
    },
    async session({ session, token }) {
      // Attach roles and user ID from token to session
      if (token?.roles) {
        session.user.roles = token.roles;
      }
      if (token?.userId) {
        session.user.id = token.userId;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
