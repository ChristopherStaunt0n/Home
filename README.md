### This is a homepage with various features:
- Agenda for keeping track of weekly tasks
- Weekly routine management
- Organized stiky notes
- Organized bookmarks
- Task notifications
- Progress meter for each week
- Hidden public vs private modes for seperating work schedule from personal

### Requirements:
- Laragon (or any alternative MYSQL database manager)
- NextJS
- MYSQL
- NPM

### To use project:
1) Clone, copy, or extract project into Laragon www folder or equivalent (project currently only available on localhost)
2) Open terminal in project folder and run npm ci (may take multiple reinstall attempts to work if your unlucky)
3) Create database with appropiate tables (see instructions below)
4) Run HomeCenter_Open.bat file
+ Uncomment 'devIndicators: false' in next.config.ts to hide Dev Tools
+ Create a dekstop shortcut to HomeCenter_Open.bat file and assign the ExeIcon.ico file in public folder as its icon

### Setting up database:
1) Create database using labels and logins of your choice
2) Run SetupFiles.bat file
3) Apply database information to .env.local file
4) Create tables in database using MYSQL commands in '/app/src/Setup/Database/Tables.txt' file
5) Fill table(s) using command(s) in '/app/src/Setup/Database/Fill.txt' file

### Themes
1) Copy 'Template' folder from '/app/src/Styles/Themes/Default' folder to new 'Presets' folder
2) Rename new 'Template' folder (anything except 'Default')
3) Add new folder name with "" to corresponding const variable array in '/app/src/Backend/Themes/Custom.js' file
4) Edit renamed template folder to you preferences
5) Access theme choices from the dropdown menu in the top left corner of site
+ Store images '/app/src/Images/' folder
+ Store favicons in 'public/Themes/Custom' with same name as new template folder

### Bookmarks
- Create & delete bookmarks using the apps in the footer section
