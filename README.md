# Localhost Hompage
- https://github.com/ChristopherStaunt0n/Home

## This is a NextJS built homepage with various features:
- Agenda for keeping track of weekly tasks
- Weekly routine management
- Organized sticky notes & bookmarks
- Task notifications
- Progress meter for each week
- Hidden public vs private modes for separating work schedule from personal
- Screen saver mini-game (WIP)

### Requirements:
- MYSQL/Apache Database Manager (ex: Laragon)
- NPM

## To use project:
1) Download and/or setup an appropriate database manager
1) Download & extract project to a location of your choosing
2) Open terminal in project folder and run 'npm ci' (may take multiple reinstall attempts if your unlucky)
3) Create a database (remember the login info), run the Setup.bat file, and apply new database login information in the popup prompts
4) Run HomeCenter_Open.bat file
+ Uncomment 'devIndicators: false' in next.config.ts to hide Dev Tools
+ Create a desktop shortcut to HomeCenter_Open.bat file and assign the ExeIcon.ico file in public folder as its icon

### Agenda
- Tasks are located under each day's label (click on quill to create new task).
- Check mark button completes task, computer button makes task notes full screen, & hammer button edits task.
- Plans, Review, & Notes sections at the bottom can be double clicked for full screen mode.
- Routines appear from dropdown menu in 'Routines' label (click individual routines for toggling completion).
- Save changes using control panel in left column (progress will autosave every 5 seconds or whenever switching modes/subpages).

### Routine
- Click on day's label to add a new routine for that day.
- Click on individual routines for editing.
- Weekly section is for routines that don't have a set day for intended completion.
- Use control panel in left column to 'Assign' selected routine for current week onwards.

### Bookmarks
- Create & delete bookmarks using the apps in the footer section.
- Grouped bookmarks are accessed through shared dropdown menus.

### Sticky Notes
- Access notes & subcategories from 'Groups' dropdown menu in right column.
- Recent & bookmarked notes are located in bottom section of column.

### Themes
1) Copy 'Template' folder from '/app/src/Styles/Themes/Default' folder to new 'Presets' folder (one should have already been made during Run SetupFiles.bat step automatically)
2) Rename new 'Template' folder (anything except 'Default')
3) Add new folder name with "" to corresponding const variable array in '/app/src/Backend/Themes/Custom.js' file
4) Edit the new template folder to you preferences
5) Access theme templates from the dropdown menu in the top left corner of main site page after setup
+ Store related images '/app/src/Images/' folder
+ Store related favicons in 'public/Themes/Custom' with same name as new template folder

## FAQ
Q: Project is failing to run after installation. What do I do?
- This likely an installation error.
- The only fix I have found was to repeatedly clean reinstall the entire project until it worked.
- Otherwise, it might be an issue with connecting to the database.
- Make sure the database is running on the same port in your '.env.local' file and that both MYSQL & Apache are active.
- Also make sure the project hasn't been moved recently (if so, clean the cache or reinstall).

Q: How do I create login for the database?
- Open session manager or equivalent.
- Create new session then add a username.
- Open the new session (create database if you haven't already).
- Go to Query and input below commands (adjust where necessary).
1) CREATE USER 'username'@'localhost' IDENTIFIED BY 'password';
2) GRANT ALL PRIVILEGES ON * . * TO 'username'@'localhost';
3) FLUSH PRIVILEGES;
- Got back to session manager and add password then save.

Q: Why are the font, bold, italics, align, etc buttons not working?
- They have not been implemented yet.

Q: Why are the routine title & notes sections of sync?
- This is a bug that I am aware of.
- Open & close routine section after each switch to update ui to correct title & notes for now.

Q: How do I swap between public & private modes?
- Click on the 'Welcome' logo in the header.

Q: Clicking on 'Welcome' logo is not swapping modes. What do I do?
- Passkey is probably enabled (default is 'W', 2nd 'e', then 'c').
- Check './app/src/Components/Header/Header.jsx' for AttemptPass() & HiddenCompartments() functions under the Space() component.
- Sequence should be listed as 'clue' in AttemptPass().
- Inputs should be in HiddenCompartments().
- To disable/enable this feature, click on the '!' in Private mode header.
- Feel free to edit header title/sequences as you see fit.

Q: How does the progress meter work?
- By default, yellow represents public task/routine completion.
- Blue represents private task/routine completion.
- Green is the overlap of public & private task/routine completion.
- Colors can be changed in 'app/src/Styles/Themes/' based on current theme package (seek .ProgressMeter under Agenda.module.css).

Q: What do the bed & blanket buttons do?
- Bed button marks the corresponding day as having slept in.
- Blanket button marks the corresponding day as having taken a nap break.
- Visual effects can be changed in 'app/src/Styles/Themes/' based on current theme package (seek bottom of Agenda.module.css).
- Button images can be replaced in 'app/src/Images/Any' folder (feel free to change their purpose).

Q: What does task importance do?
- For now it only determines if it pops up in header notifications past current week.

Q: What does routine importance do?
- Determines if routine counts towards progress meter.

Q: How do I swap between themes?
- Using dropdown menu in to left corner of page.

Q: Why isn't the favicon updating?
- Chances are that the modes are being swapped too rapidly or you added a favicon file that isn't '.ico' or '.gif'.
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
- Probably a result of no tasks/routines being expected under that time frame.
- Still needs further testing.

Q: How do I access the screen saver?
- Under private mode, click the '?' in the header section.
- I currently do not recommend using this at the moment.
- This is still a work in progress.
- To change inactivity timer trigger, edit the 'InactivityTimer' value in 'app/src/Central.jsx' (...default is 5 seconds).