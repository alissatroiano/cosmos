![Cosmos](https://i.im.ge/2025/01/12/z4hLTm.Your-paragraph-text.png)

## Cosmos

Cosmos is a space game that challenges players to control a planet's movement in orbit and avoid colliding into other planets. Cosmos was built for [AWS's Game Builder Challenge](https://awsdevchallenge.devpost.com/?ref_feature=challenge&ref_medium=your-open-hackathons&ref_content=Submissions+open).

## Inspiration

Cosmos was built for the [AWS Game Builder Challenge](https://awsdevchallenge.devpost.com/?ref_feature=challenge&ref_medium=your-open-hackathons&ref_content=Submissions+open) hosted by [Devpost](https://awsdevchallenge.devpost.com/?ref_feature=challenge&ref_medium=your-open-hackathons&ref_content=Submissions+open). The AWS hackathon challenges developers to  use Amazon Q Developer, a generative AI-powered assistant, to build games faster. 

I needed to build a functional, visually appealing game by the given deadline and I was eager to learn a new framework. Luckily, the [AWS Game Builder Challenge](https://awsdevchallenge.devpost.com/?ref_feature=challenge&ref_medium=your-open-hackathons&ref_content=Submissions+open) gives contestants the opportunity to use Amazon Q Developer, a powerful AI assistant, to speed up development. Because of this, I decided to build a game based on something I really love (space) using a technology I have never used, Three.js. 

## What it does

The main objective of Cosmos is to use the game's mechanics to move around your orbit as many times as possible without colliding into other planets on the adjacent orbit.

### How to Play
##### **If you're playing on Desktop:**
- Use the Arrow Up and Arrow Down keys on your keyboard to control your planet's movement. 
  - Use Arrow Up to move accelerate 
  - Use Arrow Down to decelerate
  
##### **If you're playing on Mobile:**
- Click the arrow up button on the bottom left corner of the screen to accelerate
- Click the arrow down button on the bottom left corner of the screen to decelerate

##### Game Over
- You lose Cosmos if and when you collide with another planet object.
- When the game ends, press 'R' on your keyboard or click the reload icon to play again!

## How I built it

I followed [this tutorial](https://www.youtube.com/watch?v=JhgBwJn1bQw) to learn the basics of Three.JS and get a general idea of how my planets would move in orbit. Once I had a general understanding of the framework, I prompted Amazon Q Developer ("AQ") to change the game's mechanics, create a space theme, and use planets (spheres) instead of vehicles (boxes) for objects.

### Working with Q

Because I was part of GitHub Copilot's Beta Testing team in 2022, I already knew that prompts must be detailed, logical, and specific when working with a local IDE assistant of this nature.

#### Scene

I wrote code comments with common Three.JS terms to prompt AQ into setting up the scene, camera, and renderer. 

#### UX 

I then prompted AQ to create a dark background and add stars to create an outer space environment.

  
The following tools and technologies were used to build Cosmos

#### Technologies

- [Three.JS]()
- [Amazon Q]()
- [CSS]()
- [HTML]()

#### Hosting Provider
- [Amazon Amplify](https://aws.amazon.com/amplify) was used to deploy [Cosmos](https://main.d508w1gr1qq2g.amplifyapp.com/) to a live web server. 

## Challenges I ran into

### Explaining the game to Amazon Q

In the early stages of development, I had some trouble 

#### Setting up the track

During the first few attempts  

## Accomplishments that I'm proud of

## What I learned

## What's next for Cosmos

