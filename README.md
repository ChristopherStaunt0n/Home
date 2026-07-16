### This is a NextJS built homepage with various features:
- Agenda for keeping track of weekly tasks
- Weekly routine management
- Organized sticky notes & bookmarks
- Task notifications
- Progress meter for each week
- Hidden public vs private modes for separating work schedule from personal
- Screen saver mini-game (WIP)

### Requirements:
- Laragon (or an alternative MYSQL database manager)
- Apache
- MYSQL
- NPM

### To use project:
1) Clone, copy, or extract project into Laragon www folder or equivalent (project currently only available on localhost)
2) Open terminal in project folder and run npm ci (may take multiple reinstall attempts to work if your unlucky)
3) Create database with appropriate tables (see instructions below)
4) Run HomeCenter_Open.bat file
+ Uncomment 'devIndicators: false' in next.config.ts to hide Dev Tools
+ Create a desktop shortcut to HomeCenter_Open.bat file and assign the ExeIcon.ico file in public folder as its icon

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

### FAQ
Q: Projects/Turbopack is failing to run after installation. What do I do?
- This likely an installation error.
- I've had this issue before multiple times.
- Though I've only tried setting up this project on a couple computers using the same third party software.
- The only fix I have found was to repeatedly clean reinstall the project until it works.
- Otherwise, it might be an issue with connecting to the database.
- Make sure the database (MYSQL) is running on port 3306.
- Make sure that Apache is running.
- Also make sure project is installed in an appropriate location to access database (www folder if using Laragon).
- Be sure that you are accessing 'localhost:3000'.

Q: Why are the font, bold, italics, align, etc settings working?
- They have not been implemented yet.

Q: Why are the routine section titles & notes of synch?
- This is a bug that I am aware of.
- Open & close routine section after each switch to update changes for now.

Q: How do I swap between public & private modes?
- Click on the 'Welcome' logo in the header.

Q: Clicking on 'Welcome' logo is not swapping modes. What do I do?
- Passkey is probably enabled (default is 'W', 2nd 'e', then 'c').
- Check './app/src/Components/Header/Header.jsx' for AttemptPass() & HiddenCompartments() under Space().
- Sequence should be listed as 'clue' in AttemptPass().
- Inputs should be in HiddenCompartments().
- To disable/enable this feature, click on the '!' in Private mode header.

Q: How does the progress meter work?
- By default, yellow represents public task/routine completion.
- Blue represents private.
- Green is the overlap of public & private task/routine completion.
- Colors can be changed in 'app/src/Styles/Themes/' based on current theme package (seek .ProgressMeter under Agenda.module.css).

Q: What do the bed & blanket buttons do?
- Bed button marks corresponding day as having slept in.
- Blanket button marks corresponding day as having taken a nap break.
- Visual effects can be changed in 'app/src/Styles/Themes/' based on current theme package (seek bottom of Agenda.module.css).

Q: How do I swap between themes?
- Using dropdown menu in to left corner of page.

Q: Why isn't the favicon updating?
- Chances are that the modes are being swapped to rapidly or you added a favicon file that isn't '.ico' or '.gif'.
- Try waiting ~5 seconds between each mode swap or converting file to a compatible format.

Q: Why isn't favicon '.gif' animation playing out?
- This is a bug that I am aware of.
- Unfortunately, I haven't found any fixes that do not lead to more bugs.

Q: Why doesn't the top left corner date match the correct one?
- This is a bug that I am aware of.
- It involves an issue with time zones converting incorrectly and usually only seems to occur on late Saturday nights.
- For now, just ignore it and switch agenda week to current week.

Q: Why are the notifications showing next week's tasks & routines?
- See question response above.

Q: Why is the 'Soon' notification tab missing?
- I am not sure why this happens.
- Probably a result of no tasks/routines expected under that time frame.
- Still needs further testing.

Q: How do I access the screen saver?
- Under private mode, click the '?'.
- I currently do not recommend using this at the moment.
- This is still a work in progress.
- To change inactivity timer trigger, edit the 'InactivityTimer' value in 'app/src/Central.jsx' (...default is 5 seconds).