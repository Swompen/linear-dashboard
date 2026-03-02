# Todo App

Task management application built with Next.js, featuring Discord OAuth authentication and Linear integration.

## Features

- Kanban-style task board with drag-and-drop functionality
- Discord OAuth authentication with role-based access control
- Linear integration for issue tracking and synchronization
- Real-time task updates and collaboration
- Responsive design with Tailwind CSS

## Requirements

- Node.js 16+ or Docker
- Discord application credentials (Client ID and Secret)
- Linear API key and workspace team ID
- Environment variables configured

## Quick Start

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/Swompen/todo-app.git
cd todo-app
```

2. Install dependencies:
```bash
cd app
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
# Edit with your actual configuration values
nano .env.local
```

4. Run development server:
```bash
npm run dev
```

Access at http://localhost:3000

### Docker Deployment

1. Configure environment:
```bash
cp .env.example .env
# Edit with your configuration
nano .env
```

2. Deploy:
```bash
docker-compose up -d
```

Access at http://localhost:3501

## Environment Configuration

Create `.env` and `app/.env.local` files with the required variables. See `.env.example` for complete list.

### Required Variables

- `LINEAR_API_KEY` - Linear workspace API key
- `LINEAR_TEAM_ID` - Linear team identifier (UUID)
- `DISCORD_CLIENT_ID` - Discord OAuth application ID
- `DISCORD_CLIENT_SECRET` - Discord OAuth client secret
- `DISCORD_GUILD_ID` - Discord server/guild ID
- `DISCORD_STAFF_ROLE_IDS` - Comma-separated staff role IDs
- `DISCORD_BOARD_ROLE_ID` - Board access role ID
- `NEXTAUTH_URL` - Application URL for OAuth callback
- `NEXTAUTH_SECRET` - JWT encryption secret

### Configuration Sources

**Discord Setup:**
- Developer Portal: https://discord.com/developers/applications
- Generate OAuth2 credentials
- Add redirect URI: `{NEXTAUTH_URL}/api/auth/callback/discord`
- Copy Guild ID and Role IDs from server settings (Developer Mode enabled)

**Linear Setup:**
- API Settings: https://linear.app/settings/api
- Generate API key
- Find Team ID in workspace settings

**NextAuth Configuration:**
- Generate secret: `openssl rand -base64 32`
- Set URL to your production domain

## Security

Never commit `.env` files. The repository includes `.gitignore` to prevent accidental exposure.

Always use environment variables for:
- API keys
- OAuth secrets
- Authentication tokens
- Sensitive configuration

Rotate secrets regularly and review access permissions.

## Available Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm start        # Production server
npm run lint     # Run linting
```

## Project Structure

```
app/
  components/      # React components
    kanban/        # Kanban board components
    layout/        # Layout components
    modals/        # Modal dialogs
    ui/            # UI components
  pages/           # Next.js pages and API routes
  styles/          # Global styles
  tailwind.config.js
```

## Troubleshooting

**Port already in use:**
- Change port in docker-compose.yml or use: `PORT=3502 npm run dev`

**Discord authentication fails:**
- Verify DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET in .env
- Check redirect URI is set correctly in Discord Developer Portal
- Ensure NEXTAUTH_URL matches your deployment domain

**Linear API errors:**
- Confirm LINEAR_API_KEY is valid and not expired
- Verify LINEAR_TEAM_ID is correct
- Check API key has required permissions

**Missing environment variables:**
- Verify all variables in .env.example are set in your .env
- Restart the development server after changing .env

## Contributing

See CONTRIBUTING.md for guidelines.

## License

MIT License - see [LICENSE](LICENSE) for details

## Support

Issues: https://github.com/Swompen/todo-app/issues
