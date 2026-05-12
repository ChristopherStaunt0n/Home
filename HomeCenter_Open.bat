if not "%1"=="min" start /min "" %0 min & exit
start chrome http://localhost:3000/
npm run dev