For my final project I created a web game application with express js, that and allow to play
two differents snake game.

My application contain three web pages.


1 - The first page is a simple menu with two buttons (solo and multi).

2 - The 'solo' button render a new page that allow to play a classic snake game.

3 - The 'multi' button allow you to play a special snake game with 2 players.
    On clic on the button tou will have to enter a name and then press enter to send the request to the server.
    Then if the name is not already used, you will have to wait for another player if you are
    alone 'in the waiting room'. Or if another player is already waiting a new page will be render for both players
    and allow you to play the game.
    In this game there is a time limit and the player with the longest snake won the game. You are allow in this game
    to eat your opponent !
    When the time is over a button will be show and if both players click on it a new game will start.
    If one of the player leave, the other player will get a message.


I used express js to create this web application and websocket for the multiplayer mode.
