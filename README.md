# Lifestyle Lovers
My application is a dating application where users can find a partner that can fit in their lifestyle. 

## Description

## Install
If you want to install my application, you have to do the following:

**1.** First you have to git clone my link: 
```javascript
git clone https://github.com/ninavanbergen/be-assessment-2.git
```


**2.** Then you need to go to that file, by doing so:
(if you renamed the file then you need to change the name after cd /)
```javascript
cd /be-assessment-2.git 
```


**3.** When you're in the file, you need to install some things, let's start with npm. [Here](https://github.com/npm/npm) is a link to an explanation of npm.
(you will see a download bar, it may take a while)
```javascript
npm install
```
After you've done ```npm install``` it is nice to also make an package.json file. You can make that by doing this:
```javascript
npm init
```

In the following steps you will learn how to install all the things that you will need to make the application work. I will explain later how you require them all in your js file.


**4.** Let's begin with installing express! But what is express? [Here](https://github.com/expressjs/express) is a link to an explanation of express.
(again, you may see a download bar, it may take a while)
```javascript
npm install express
```


**5.** We also need to install body-parser. It's a plugin for express, that makes the values that are found in the application easier to read. [Here](https://github.com/expressjs/body-parser) is a full explanation of it. 
```javascript
npm install body-parser
```


**6.** Let's install multer. [Here](https://github.com/expressjs/multer) is a full explanation of it.
```javascript
npm install multer
```


**7.** Right now we are going to install a very important one. It's called MySQL. 

[Wikpedia](https://nl.wikipedia.org/wiki/SQL) says:
> SQL (Structured Query Language) is a […] language used in programming and designed for managing data held in a relational database […].

If you don't understand it right away, don't worry, I had the same. Here are some links that explain it more and show you some examples of how to work in MySQL:

* [Link 1](https://www.mysql.com/about/)

* [Link 2](https://gist.github.com/hofmannsven/9164408)

* [Link 3](https://www.guru99.com/sql.html)

Take your time to read these websites and to understand MySQL, because if you know how mysql works, you will understand my code much better! 

The first thing you need to do before you'll download MySQL, is download [homebrew](https://brew.sh). Click on the link to see how to download it. 

If that succeeds, you need to do an update of homebrew:
```javascript
brew update
```
And finally we are going to install MySQL:
```javascript
brew install mysql
```


**8.** We are also going to install [multer](https://github.com/expressjs/multer):
```javascript
npm install multer
```


**9.** Finally, the last thing we need to install is [session](https://github.com/expressjs/session):
```javascript
npm install express-session
```

That's it! You now have installed all the things you need to make the application work. Good job.


## Start Server 
If you want to start the server, you need to do this in your terminal:
```javascript
npm start
```


## Structure of the project (files, folders)
My project has some important files and some folders. The server.js file is the file that contains all of my main code. There are a lot of comments there to make it easier to understand. In my static folder are all the 'static' files, so files like css and images. They don't change, that's why they are called static. I also have a folder named view. View contains all of my ejs templates that will be needed in this project, they are templates for every page in my project. 


## Server.js 
Like I said, I made an server.js file that contains all of my main code to make my project work. It binds everything together, I had a lot of work doing this one. Here I am going to explain what you need to have in your server.js to link all the packages we just installed. 

So, we've just installed some things like express and multer and MySQL. The following code links those installed packages and more to my project:
```javascript
var express = require('express')
var mysql = require('mysql')
```
I've done this for all of them, so for express, multer, mysql, express-session and body-parser. But also path and ejs. I haven't installed those, but you do need to link them in your file. 
So I also worked with a lot of app.get and app.post codes, those are requests and responses. The app.post is needed for when someone tries to log in or register. The user basically posts something. The app.get is when someone wants to get a thing from a page, for example going to another page. This is an example of an app.get and an app.post that I have in my server.js file. 
```javascript
app.post('/portal', handleLogin)
app.get('/profile/:id', profile)
```
So, when /portal is being asked, the function handleLogin will be runned. This one is about logging in so that is why it is an app.post = the user posts data. /profile/:id is where the user goes after logging in. /:id will be changed by the id of the user. That id is stored in my MySQL database. The function profile will also be runned. 



