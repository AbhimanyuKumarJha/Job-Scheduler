# Job Scheduler API

A Node.js job scheduler application built with TypeScript, Express, Drizzle ORM, and PostgreSQL.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

Update the `DATABASE_URL` in your `.env` file:

```
DATABASE_URL="postgresql://username:password@localhost:5432/job_scheduler"
```

### 3. Set Up Drizzle

Generate migrations:

```bash
npm run db:generate
```

Push schema to database:

```bash
npm run db:push
```

Or run migrations:

```bash
npm run db:migrate
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Project Structure

```
job-scheduler/
├── src/
│   ├── db/
│   │   ├── index.ts         # Database connection
│   │   └── schema.ts        # Database schema
│   └── index.ts             # Express server entry point
├── drizzle/                 # Migration files
├── dist/                    # Compiled JavaScript files
├── .env                     # Environment variables
├── drizzle.config.ts        # Drizzle configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Project dependencies
└── nodemon.json             # Nodemon configuration
```

## API Endpoints

- `GET /` - API welcome message
- `GET /health` - Health check endpoint (checks database connection)

## Next Steps

1. Configure your PostgreSQL database connection in `.env`
2. Define your data models in `src/db/schema.ts`
3. Run `npm run db:generate` to create migrations
4. Run `npm run db:push` to push schema to database
5. Add your business logic and routes in the `src` directory
6. Start building your job scheduler features!

## Technologies Used

- **Node.js** - Runtime environment
- **TypeScript** - Type-safe JavaScript
- **Express** - Web framework
- **Drizzle ORM** - Modern TypeScript ORM
- **PostgreSQL** - Relational database
- **Nodemon** - Development auto-restart
