# Wedding RSVP Project Rules
## Language
- Always respond in English.
- Do not switch languages unless explicitly asked.

## Allowed
- Edit files in /app
- Edit files in /components
- Edit files in /lib
- Edit files in /prisma
- Create tests in /tests

## Forbidden
- Do not expose guest emails publicly
- Do not commit .env files
- Do not hardcode API keys
- Do not change deployment config without approval

## Architecture
- Use Next.js App Router
- Use TypeScript
- Use Tailwind CSS
- Use Prisma for database access
- Keep admin and guest flows separate

## Security
- Guest pages must require invite code or password
- Admin routes must require admin authentication
- RSVP submissions must be validated server-side
