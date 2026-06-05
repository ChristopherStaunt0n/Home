### This is a homepage with various features:
> Agenda for keeping track of weekly tasks
> Weekly routine management
> Organized stiky notes
> Task notifications
> Progress meter for each week
> Hidden public vs private modes for seperating work schedule from personal

### Requirements:
> Laragon
> NextJS
> MYSQL
> NPM

### To use project:
1) Clone or copy project into Laragon www folder
2) Open terminal in project folder and run npm ci (may take multiple reinstalls to work if your unlucky)
3) Create database with appropiate tables (see instructions below)
4) Run HomeCenter_Open.bat file
+ Create a dekstop shortcut to HomeCenter_Open.bat file and assign the ExeIcon.ico file in public folder as its icon

### Setting up database:
1) Create database using labels and logins of your choice
2) Create a folder in 'app/src/Backend' named Login
3) Create Access.js file with below content and fill with database login information from above

const Login = {
    host: "localhost",
    user: "Your_User_Name",
    pass: "Your_Password",
    data: "Your_Database"
}
export default Login;

4) Create tables in database using below MYSQL commands

CREATE TABLE `agenda` (
	`Week` DATE NOT NULL,
	`Public` JSON NOT NULL,
	`Private` JSON NOT NULL,
	`Sleep` JSON NOT NULL,
	`Schedule` INT NOT NULL DEFAULT '1',
	PRIMARY KEY (`Week`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `notes` (
	`ID` INT NOT NULL,
	`Mode` VARCHAR(7) NOT NULL DEFAULT 'Private' COLLATE 'utf8mb4_0900_ai_ci',
	`Group` JSON NOT NULL,
	`Title` VARCHAR(25) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`Message` LONGTEXT NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	PRIMARY KEY (`ID`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `ref` (
	`Basis` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_0900_ai_ci',
	`Data` JSON NOT NULL,
	PRIMARY KEY (`Basis`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `routine` (
	`ID` INT NOT NULL,
	`Schedule` JSON NOT NULL,
	PRIMARY KEY (`ID`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;

CREATE TABLE `themes` (
	`ID` INT NOT NULL,
	`Title` VARCHAR(50) NOT NULL DEFAULT 'Unnamed Theme' COLLATE 'utf8mb4_0900_ai_ci',
	`Mode` VARCHAR(7) NOT NULL DEFAULT 'Private' COLLATE 'utf8mb4_0900_ai_ci',
	`CSS` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_0900_ai_ci',
	PRIMARY KEY (`ID`) USING BTREE,
	UNIQUE INDEX `Title` (`Title`) USING BTREE
)
COLLATE='utf8mb4_0900_ai_ci'
ENGINE=InnoDB
;

5) Fill ref table using command below

INSERT INTO `ref` (`Basis`, `Data`) VALUES
	('Bookmark_General_Notes', '{"ids": []}'),
	('ModeLock_Toggle', '{"active": false}'),
	('Recent_General_Notes', '{"ids": []}'),
	('Routine_Current', '{"currentId": 0}'),
	('ScreenSaver_Toggle', '{"active": false}'),
	('Themes_Current', '{"public": "0", "private": "0"}');









## Old ReadMe Default Below

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
