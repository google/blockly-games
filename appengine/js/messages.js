/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview English strings for Blockly Games.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';


/// The project name.
BlocklyGames.Msg['Games.name'] = 'Blockly Games';

/// title - Specifies that this is Blockly's '''Puzzle''' game.  Use the word for a jigsaw puzzle.\n{{Identical|Puzzle}}
BlocklyGames.Msg['Games.puzzle'] = 'Puzzle';

/// title - Specifies that this is Blockly's '''Maze''' game.\n{{Identical|Maze}}
BlocklyGames.Msg['Games.maze'] = 'Maze';

/// title - Specifies that this is Blockly's '''Bird''' game.\n{{Identical|Bird}}
BlocklyGames.Msg['Games.bird'] = 'Bird';

/// title - Specifies that this is Blockly's '''Turtle''' game.\n{{Identical|Turtle}}
BlocklyGames.Msg['Games.turtle'] = 'Turtle';

/// title - Specifies that this is Blockly's '''Movie''' game.\n{{Identical|Movie}}
BlocklyGames.Msg['Games.movie'] = 'Movie';

/// title - Specifies that this is Blockly's '''Music''' game.\n{{Identical|Music}}
BlocklyGames.Msg['Games.music'] = 'Music';

/// title - Specifies that this is Blockly's '''Pond Tutor''' game.  It is a series of lessons or practice levels to allow users to play the more advanced '''Pond''' game (in your language: '''{{:Blockly:Games.pond/{{RelevantLanguage}}}}''').
BlocklyGames.Msg['Games.pondTutor'] = 'Pond Tutor';

/// title - Specifies that this is Blockly's '''Pond''' game.
BlocklyGames.Msg['Games.pond'] = 'Pond';

/// title - Specifies that this is Blockly's '''Genetics''' game.\n{{Identical|Genetics}}
BlocklyGames.Msg['Games.genetics'] = 'Genetics';

/// alert - Displayed when a level is complete.
BlocklyGames.Msg['Games.linesOfCode1'] = 'You solved this level with 1 line of JavaScript:';

/// alert - Displayed when a level is complete.  %1 is an integer greater than 1.
BlocklyGames.Msg['Games.linesOfCode2'] = 'You solved this level with %1 lines of JavaScript:';

/// alert - This is displayed when the user solves the level, inviting them to procede to the next level of difficulty.  %1 is an integer greater than 1.
BlocklyGames.Msg['Games.nextLevel'] = 'Are you ready for level %1?';

/// alert - This is displayed when the user solves the most difficult level and is going to go to the next game.
BlocklyGames.Msg['Games.finalLevel'] = 'Are you ready for the next challenge?';

/// Label in front of a field where the user is requested to type a title for their work.\n{{Identical|Title}}
BlocklyGames.Msg['Games.submitTitle'] = 'Title:';

/// tooltip - Pressing this button will cause the current program to be saved and for a URL to be shown to later retrieve it.
BlocklyGames.Msg['Games.linkTooltip'] = 'Save and link to blocks.';

/// tooltip - Pressing this button runs the computer program the user has written.
BlocklyGames.Msg['Games.runTooltip'] = 'Run the program you wrote.';

/// button label - Pressing this button runs the computer program the user has written.
BlocklyGames.Msg['Games.runProgram'] = 'Run Program';

/// tooltip - Pressing this button restores the player to the start position and enables the user's program to be run again.
BlocklyGames.Msg['Games.resetTooltip'] = 'Stop the program and reset the level.';

/// button label - Pressing this button causes the output of the program to be erased but does not delete the user's program).\n{{Identical|Reset}}
BlocklyGames.Msg['Games.resetProgram'] = 'Reset';

/// button label - Pressing this button shows help information.\n{{Identical|Help}}
BlocklyGames.Msg['Games.help'] = 'Help';

/// category - Blocks related to [https://github.com/google/blockly/wiki/Logic logic].\n{{Identical|Logic}}
BlocklyGames.Msg['Games.catLogic'] = 'Logic';

/// category - Blocks related to [https://en.wikipedia.org/wiki/Control_flow#Loops loops].\n{{Identical|Loops}}
BlocklyGames.Msg['Games.catLoops'] = 'Loops';

/// category - Blocks related to mathematics.\n{{Identical|Math}}
BlocklyGames.Msg['Games.catMath'] = 'Math';

/// category - Blocks related to [https://github.com/google/blockly/wiki/Text text processing].\n{{Identical|Text}}
BlocklyGames.Msg['Games.catText'] = 'Text';

/// category - Blocks related to [https://github.com/google/blockly/wiki/Lists lists].\n{{Identical|List}}
BlocklyGames.Msg['Games.catLists'] = 'Lists';

/// category - Blocks related to [https://github.com/google/blockly/wiki/Colour colour].\n{{Identical|Color}}
BlocklyGames.Msg['Games.catColour'] = 'Colour';

/// category - Blocks related to [https://github.com/google/blockly/wiki/Variables variables].\n{{Identical|Variables}}
BlocklyGames.Msg['Games.catVariables'] = 'Variables';

/// category - Blocks related to [https://en.wikipedia.org/wiki/Subroutine defining or using procedures/functions].\n{{Identical|Functions}}
BlocklyGames.Msg['Games.catProcedures'] = 'Functions';

/// alert - The URL is invalid or a server error occurred.  This message will be followed by technical information useful to engineers trying to understand the problem.
BlocklyGames.Msg['Games.httpRequestError'] = 'There was a problem with the request.';

/// alert - After the user has pressed a button to save his/her program, this provides the URL (%1) to retrieve the program.  The characters '\n\n' indicate that a blank line will be displayed before the URL (in English).  Leave those in unless you move %1 to the beginning or middle of the text, in which case you should use your judgment about where blank lines would be most useful.\n\nParameters:\n* %1 - URL of saved program.
BlocklyGames.Msg['Games.linkAlert'] = 'Share your blocks with this link:\n\n%1';

/// alert - A request to retrieve a stored program does not have a valid URL. %1 is the invalid portion of the URL.
BlocklyGames.Msg['Games.hashError'] = 'Sorry, \'%1\' doesn\'t correspond with any saved program.';

/// alert - There was a problem loading a file previously saved by the user.  The most likely reason for the problem is that it was created with an earlier, incompatible version of Blockly.  This message will be followed by technical information useful to engineers trying to understand the problem.
BlocklyGames.Msg['Games.xmlError'] = 'Could not load your saved file. Perhaps it was created with a different version of Blockly?';

/// alert - After the user has submitted his/her program to the gallery, it must wait for approval.  Please make this message funny!
BlocklyGames.Msg['Games.submitted'] = 'Thank you for this program!  If our staff of trained monkeys like it, they will publish it to the gallery within a couple of days.';

/// variable name - Default [https://github.com/google/blockly/wiki/Variables variable] representing a [https://github.com/google/blockly/wiki/Lists list].  This should be a single word, preferably short.\n{{Identical|List}}
BlocklyGames.Msg['Games.listVariable'] = 'list';

/// variable name - Default [https://github.com/google/blockly/wiki/Variables variable] representing a [https://github.com/google/blockly/wiki/Text piece of text].  This should be a single word, preferably short.\n{{Identical|Text}}
BlocklyGames.Msg['Games.textVariable'] = 'text';

/// Warning dialog. Options are 'OK' and 'Cancel'.
BlocklyGames.Msg['Games.breakLink'] = 'Once you start editing JavaScript, you can\'t go back to editing blocks. Is this OK?';

/// Label on a tab that contains blocks editor.\n{{Identical|Block}}
BlocklyGames.Msg['Games.blocks'] = 'Blocks';

/// alert - This is displayed when the user solves the level.\n{{Identical|Congratulation}}
BlocklyGames.Msg['Games.congratulations'] = 'Congratulations!';

/// callout - This dialog gives the user the option to skip this level.
BlocklyGames.Msg['Games.helpAbort'] = 'This level is extremely difficult. Would you like to skip it and go onto the next game? You can always come back later.';

/// Confirmation prompt for deleting all the user's data.
BlocklyGames.Msg['Index.clear'] = 'Delete all your solutions?';

/// Brief description of Blockly Games.
BlocklyGames.Msg['Index.subTitle'] = 'Games for tomorrow\'s programmers.';

/// Link to a description of Blockly Games, intended for parents and teachers.
BlocklyGames.Msg['Index.moreInfo'] = 'Info for educators...';

/// Label next to button for deleting all the user's data.
BlocklyGames.Msg['Index.startOver'] = 'Want to start over?';

/// Text on button for deleting all the user's data.
BlocklyGames.Msg['Index.clearData'] = 'Clear data';

/// Duck: The bird.\n{{Identical|Duck}}
BlocklyGames.Msg['Puzzle.animal1'] = 'Duck';

/// Feathers: A trait that ducks have.\n{{Identical|Feather}}
BlocklyGames.Msg['Puzzle.animal1Trait1'] = 'Feathers';

/// Beak: A trait that ducks have.\n{{Identical|Beak}}
BlocklyGames.Msg['Puzzle.animal1Trait2'] = 'Beak';

/// The URL of a page with basic information about '''ducks''', on the most appropriate linguistic edition of Wikipedia for the target language.\nMake sure you use secure HTTPS links, to avoid generating mixed contents and security alerts in browsers when viewing the current page in a secure HTTPS session. If not using Wikipedia, make sure the target is non intrusive, but if in doubt, link to a page in another suitable language supported by a Wikimedia project.
BlocklyGames.Msg['Puzzle.animal1HelpUrl'] = 'https://en.wikipedia.org/wiki/Duck';

/// Cat: The animal.
BlocklyGames.Msg['Puzzle.animal2'] = 'Cat';

/// Whiskers: A trait that cats have.\n{{Identical|Whisker}}
BlocklyGames.Msg['Puzzle.animal2Trait1'] = 'Whiskers';

/// Fur: A trait that cats have.\n{{Identical|Fur}}
BlocklyGames.Msg['Puzzle.animal2Trait2'] = 'Fur';

/// The URL of a page with basic information about '''cats''', on the most appropriate linguistic edition of Wikipedia for the target language.\nMake sure you use secure HTTPS links, to avoid generating mixed contents and security alerts in browsers when viewing the current page in a secure HTTPS session. If not using Wikipedia, make sure the target is non intrusive, but if in doubt, link to a page in another suitable language supported by a Wikimedia project.
BlocklyGames.Msg['Puzzle.animal2HelpUrl'] = 'https://en.wikipedia.org/wiki/Cat';

/// Bee: The insect.
BlocklyGames.Msg['Puzzle.animal3'] = 'Bee';

/// Honey: A trait that bees have.\n{{Identical|Honey}}
BlocklyGames.Msg['Puzzle.animal3Trait1'] = 'Honey';

/// Stinger: A trait that bees have.\n{{Identical|Stinger}}
BlocklyGames.Msg['Puzzle.animal3Trait2'] = 'Stinger';

/// The URL of a page with basic information about '''bees''', on the most appropriate linguistic edition of Wikipedia for the target language.\nMake sure you use secure HTTPS links, to avoid generating mixed contents and security alerts in browsers when viewing the current page in a secure HTTPS session. If not using Wikipedia, make sure the target is non intrusive, but if in doubt, link to a page in another suitable language supported by a Wikimedia project.
BlocklyGames.Msg['Puzzle.animal3HelpUrl'] = 'https://en.wikipedia.org/wiki/Bee';

/// Snail: The animal.\n{{Identical|Snail}}
BlocklyGames.Msg['Puzzle.animal4'] = 'Snail';

/// Shell: A trait that snails have.\n{{Identical|Shell}}
BlocklyGames.Msg['Puzzle.animal4Trait1'] = 'Shell';

/// Slime: A trait that snails have.\n{{Identical|Slime}}
BlocklyGames.Msg['Puzzle.animal4Trait2'] = 'Slime';

/// The URL of a page with basic information about '''snails''', on the most appropriate linguistic edition of Wikipedia for the target language.\nMake sure you use secure HTTPS links, to avoid generating mixed contents and security alerts in browsers when viewing the current page in a secure HTTPS session. If not using Wikipedia, make sure the target is non intrusive, but if in doubt, link to a page in another suitable language supported by a Wikimedia project.
BlocklyGames.Msg['Puzzle.animal4HelpUrl'] = 'https://en.wikipedia.org/wiki/Snail';

/// Prompt for a picture of an animal.\n{{Identical|Picture}}
BlocklyGames.Msg['Puzzle.picture'] = 'picture:';

/// Prompt for the number of legs that an animal has.\n{{Identical|Leg}}
BlocklyGames.Msg['Puzzle.legs'] = 'legs:';

/// Initial text displayed in a dropdown menu from which the user should choose an option.\n{{Identical|Choose}}
BlocklyGames.Msg['Puzzle.legsChoose'] = 'choose...';

/// Prompt for a couple of traits of an animal (e.g. Duck: feathers, beak).\n{{Identical|Trait}}
BlocklyGames.Msg['Puzzle.traits'] = 'traits:';

/// A congratulatory message displayed if the user placed all of the blocks correctly.\n\nParameters:\n* %1 - number of blocks correctly placed.  It is always an integer greater than 1.\n\nThe use of a new line character is optional.
BlocklyGames.Msg['Puzzle.error0'] = 'Perfect!\nAll %1 blocks are correct.';

/// An encouraging error message displayed if the user placed all blocks except 1 correctly.\n\nIf the number of incorrect blocks is 2 or more, Puzzle.error2 is used instead.
BlocklyGames.Msg['Puzzle.error1'] = 'Almost! One block is incorrect.';

/// An error message displayed if the user misplaced multiple blocks.\n\nParameters:\n* %1 - number of blocks incorrectly placed, which is always greater than 1 (or the message Puzzle.error1 would be used).
BlocklyGames.Msg['Puzzle.error2'] = '%1 blocks are incorrect.';

/// A message indicating that a visually distinguished block is incorrect and that the user should try to fix it.\n\nThe use of a new line character is optional.
BlocklyGames.Msg['Puzzle.tryAgain'] = 'The highlighted block is not correct.\nKeep trying.';

/// A label on a button the user can press to check his/her answers.
BlocklyGames.Msg['Puzzle.checkAnswers'] = 'Check Answers';

/// Instructions for the puzzle.  For context, see [https://blockly.games/puzzle Blockly Puzzle].
BlocklyGames.Msg['Puzzle.helpText'] = 'For each animal (green), attach its picture, choose its number of legs, and make a stack of its traits.';

/// block text - Imperative or infinitive of a verb for a person moving (walking) in the direction he/she is facing.
BlocklyGames.Msg['Maze.moveForward'] = 'move forward';

/// [[Translating:Blockly#Drop-Down_Menus dropdown]] - Imperative or infinitive of a verb for a person turning his head and body one quarter rotation counter-clockwise.  Prefer a translation that has text in common with the translation of 'turn right'.  See [[Translating:Blockly#Drop-Down_Menus]].
BlocklyGames.Msg['Maze.turnLeft'] = 'turn left';

/// [[Translating:Blockly#Drop-Down_Menus dropdown]] - Imperative or infinitive of a verb for a person turning his head and body one quarter rotation clockwise.  Prefer a translation that has text in common with the translation of 'turn left'.  See [[Translating:Blockly#Drop-Down_Menus]].
BlocklyGames.Msg['Maze.turnRight'] = 'turn right';

/// block text - Imperative or infinitive of a verb preceding one or more commands to a person.  This is part of [https://github.com/google/blockly/wiki/Loops#repeat repeat] and [https://github.com/google/blockly/wiki/IfElse#If_blocks if] blocks.\n{{Identical|Do}}
BlocklyGames.Msg['Maze.doCode'] = 'do';

/// block text - Conjunction meaning 'otherwise', introducing commands to be performed if a previous condition was not true, as in 'if x>3, do this, else do that'.  See [https://github.com/google/blockly/wiki/IfElse#If-Else_blocks].\n{{Identical|Else}}
BlocklyGames.Msg['Maze.elseCode'] = 'else';

/// callout - This is shown when the 'if-else' block is introduced.  For 'if-else' concatenate the words for 'if' and 'else/otherwise'.
BlocklyGames.Msg['Maze.helpIfElse'] = 'If-else blocks will do one thing or the other.';

/// [[Translating:Blockly#Drop-Down_Menus dropdown]] - Condensed form of 'if there is a path ahead', as in: 'if path ahead, go forward'.  Prefer translation that has text in common with 'if path to the left' and 'if path to the right'.
BlocklyGames.Msg['Maze.pathAhead'] = 'if path ahead';

/// [[Translating:Blockly#Drop-Down_Menus dropdown]] - Condensed form of 'if there is a path to the left', as in: 'if path to the left, turn left'.
BlocklyGames.Msg['Maze.pathLeft'] = 'if path to the left';

/// [[Translating:Blockly#Drop-Down_Menus dropdown]] - Condensed form of 'if there is a path to the right', as in: 'if path to the right, turn right'.
BlocklyGames.Msg['Maze.pathRight'] = 'if path to the right';

/// block text - Imperative or infinitive of a verb to repeat the following commands.  The phrase is followed by the symbol denoting the end of the maze.
BlocklyGames.Msg['Maze.repeatUntil'] = 'repeat until';

/// tooltip - Moves the icon on the screen representing the player forward one square on the maze board.
BlocklyGames.Msg['Maze.moveForwardTooltip'] = 'Moves the player forward one space.';

/// tooltip - Turns the icon on the screen representing the player 90 degrees counter-clockwise (left) or clockwise (right).
BlocklyGames.Msg['Maze.turnTooltip'] = 'Turns the player left or right by 90 degrees.';

/// tooltip - 'path' refers to a path through a maze.
BlocklyGames.Msg['Maze.ifTooltip'] = 'If there is a path in the specified direction, then do some actions.';

/// tooltip - 'path' refers to a path through a maze.
BlocklyGames.Msg['Maze.ifelseTooltip'] = 'If there is a path in the specified direction, then do the first block of actions. Otherwise, do the second block of actions.';

/// tooltip - Repeat the enclosed commands until the maze has been successfully completed (the end point reached).
BlocklyGames.Msg['Maze.whileTooltip'] = 'Repeat the enclosed actions until finish point is reached.';

/// warning - No more blocks may be added until some are removed.  Please include '%0' in the translated string.  It will be replaced with '0' and made bold.
BlocklyGames.Msg['Maze.capacity0'] = 'You have %0 blocks left.';

/// warning - Only one more block may be added. Please include '%1' in the translated string. It will be replaced with '1' and made bold.\n\nSee also:\n* {{msg-blockly|Maze.capacity2}}
BlocklyGames.Msg['Maze.capacity1'] = 'You have %1 block left.';

/// warning - Only %2 more blocks may be used, where %2 is an integer greater than 1.\n\nSee also:\n* {{msg-blockly|Maze.capacity1}}
BlocklyGames.Msg['Maze.capacity2'] = 'You have %2 blocks left.';

/// tooltip - Pressing this button runs the computer program the user has written to move the player through the maze.
BlocklyGames.Msg['Maze.runTooltip'] = 'Makes the player do what the blocks say.';

/// tooltip - Pressing this button restores the player to the start position and enables the user's program to be run again.
BlocklyGames.Msg['Maze.resetTooltip'] = 'Put the player back at the start of the maze.';

/// callout - The word words for 'stack' and 'blocks' should be the same as for stacking children's blocks. Use the imperative verb form appropriate for speaking to a child, gender unspecified.  If no gender-neutral singular/familiar form exists but a gender-neutral plural/formal form exists, use that instead.  Be sure to use the same translation of 'move forward' as above.
BlocklyGames.Msg['Maze.helpStack'] = 'Stack a couple of \'move forward\' blocks together to help me reach the goal.';

/// callout - This is displayed if a user attempts to run a program composed of multiple stacks of blocks, letting them know they need to create a single stack.
BlocklyGames.Msg['Maze.helpOneTopBlock'] = 'On this level, you need to stack together all of the blocks in the white workspace.';

/// callout - This is shown after the user has created a program on the first level.
BlocklyGames.Msg['Maze.helpRun'] = 'Run your program to see what happens.';

/// callout - This is shown after the user has run a program that does not solve the maze.
BlocklyGames.Msg['Maze.helpReset'] = 'Your program didn\'t solve the maze. Press \'Reset\' and try again.';

/// callout - This is shown when the 'repeat' block is introduced.  The word 'path' refers to a path through a maze, and 'block' refers to a child's building block.
BlocklyGames.Msg['Maze.helpRepeat'] = 'Reach the end of this path using only two blocks. Use \'repeat\' to run a block more than once.';

/// callout - This is shown after the user has used all the blocks permitted on this level.
BlocklyGames.Msg['Maze.helpCapacity'] = 'You have used up all the blocks for this level. To create a new block, you first need to delete an existing block.';

/// callout - This is a hint that the user should place a second block inside of a a 'repeat' block.
BlocklyGames.Msg['Maze.helpRepeatMany'] = 'You can fit more than one block inside a \'repeat\' block.';

/// callout - This is a hint that the user can change the appearance of the player that moves within the maze.
BlocklyGames.Msg['Maze.helpSkins'] = 'Choose your favourite player from this menu.';

/// callout - This is shown when the 'if' block is introduced.  An example of an 'if' block is: 'if there is a path to the left, turn left'.
BlocklyGames.Msg['Maze.helpIf'] = 'An \'if\' block will do something only if the condition is true. Try turning left if there is a path to the left.';

/// callout - %1 will be replaced with an image of the dropdown menu that the user needs to click.
BlocklyGames.Msg['Maze.helpMenu'] = 'Click on %1 in the \'if\' block to change its condition.';

/// callout - This advises the user to solve a maze by keeping his/her left hand in contact with the wall while proceeding through it.  The final sentence is a warning that only advanced programmers should attempt this problem, as beginners tend to get frustrated.
BlocklyGames.Msg['Maze.helpWallFollow'] = 'Can you solve this complicated maze? Try following the left-hand wall. Advanced programmers only!';

/// block text - Bird is not in possession of a worm.  This phrase is prefixed with 'if'.
BlocklyGames.Msg['Bird.noWorm'] = 'does not have worm';

/// block text - the compass direction toward which a traveler or vehicle is or should be moving; course.\n{{Identical|Heading}}
BlocklyGames.Msg['Bird.heading'] = 'heading';

/// tooltip - The bird wants to get the worm.
BlocklyGames.Msg['Bird.noWormTooltip'] = 'The condition when the bird has not gotten the worm.';

/// tooltip - Move in the direction of the given angle, where 0 means going horizontally to the right, and 90 straight up and 270 straight down.
BlocklyGames.Msg['Bird.headingTooltip'] = 'Move in the direction of the given angle: 0 is to the right, 90 is straight up, etc.';

/// tooltip - (x, y) marks the coordinate of bird, (0, 0) is the bottom left corner and (100, 100) top right.
BlocklyGames.Msg['Bird.positionTooltip'] = 'x and y mark the bird\'s position. When x = 0 the bird is near the left edge, when x = 100 it\'s near the right edge. When y = 0 the bird is at the bottom, when y = 100 it\'s at the top.';

/// callout - This is shown as instruction for the first level.
BlocklyGames.Msg['Bird.helpHeading'] = 'Change the heading angle to make the bird get the worm and land in her nest.';

/// callout - This is shown when the 'does not have worm' block is introduced.
BlocklyGames.Msg['Bird.helpHasWorm'] = 'Use this block to go in one heading if you have the worm, or a different heading if you don\'t have the worm.';

/// callout - This is shown when the 'x smaller than 50' block is introduced.
BlocklyGames.Msg['Bird.helpX'] = '\'x\' is your current horizontal position. Use this block to go in one heading if \'x\' is less than a number, or a different heading otherwise.';

/// callout - This is shown when the user first needs to modify an 'if' block.
BlocklyGames.Msg['Bird.helpElse'] = 'Click the icon to modify the \'if\' block.';

/// callout - This is shown when the user first needs to modify an 'if' block to have an 'else if' and an 'else'.\n\nMake sure to translate consistently with:\n* {{msg-blockly|CONTROLS IF MSG ELSEIF}}\n* {{msg-blockly|CONTROLS IF MSG ELSE}}
BlocklyGames.Msg['Bird.helpElseIf'] = 'This level needs both an \'else if\' and an \'else\' block.';

/// callout - This is shown to introduce the user to the logical 'and' block.\n\nMake sure to translate consistently with:\n* {{msg-blockly|LOGIC OPERATION AND}}
BlocklyGames.Msg['Bird.helpAnd'] = 'The \'and\' block is true only if both its inputs are true.';

/// callout - This is shown to demonstrate how to drag a block.\n\nTranslate consistently with:\n* {{msg-blockly|CONTROLS IF MSG ELSE}}\n* {{msg-blockly|CONTROLS IF MSG IF}}
BlocklyGames.Msg['Bird.helpMutator'] = 'Drag an \'else\' block into the \'if\' block.';

/// tooltip - In this and subsequent messages, 'turtle' refers to a stylized turtle on the screen to represent a position and direction.  This imaginary turtle is carrying a pen in its tail, so moving the turtle draws a line (or curve, etc.).  You are encouraged to play with the [https://blockly-demo.appspot.com/static/apps/turtle/index.html Turtle application] before doing this translation.
BlocklyGames.Msg['Turtle.moveTooltip'] = 'Moves the turtle forward or backward by the specified amount.';

/// [[Translating:Blockly#Drop-Down_Menus dropdown]] - Infinitive or imperative of a verb telling a turtle to move (walk) in the direction he/she is facing.  This is followed by a number indicating how far (how many pixels) to go.  Prefer a translation that has text in common with the translation of 'move backward'.  See [[Translating:Blockly#Drop-Down_Menus]].
BlocklyGames.Msg['Turtle.moveForward'] = 'move forward by';

/// [[Translating:Blockly#Drop-Down_Menus dropdown]] - Infinitive or imperative of a verb telling a turtle to move (walk) in the direction opposite to where he/she is facing.  This is followed by a number indicating how far (how many pixels) to go.  Prefer a translation that has text in common with the translation of 'move forward'.
BlocklyGames.Msg['Turtle.moveBackward'] = 'move backward by';

/// 'Left' means counter-clockwise/anti-clockwise, and 'right' means clockwise.
BlocklyGames.Msg['Turtle.turnTooltip'] = 'Turns the turtle left or right by the specified number of degrees.';

/// [[Translating:Blockly#Drop-Down_Menus dropdown]] - Infinitive or imperative of verb telling a turtle to rotate clockwise.  This is followed by a number indicating how far (how many degrees) to turn.  Prefer a translation that has text in common with the translation of 'turn left by'.
BlocklyGames.Msg['Turtle.turnRight'] = 'turn right by';

/// [[Translating:Blockly#Drop-Down_Menus dropdown]] - Infinitive or imperative of verb telling a turtle to rotate counter-clockwise (anti-clockwise).  This is followed by a number indicating how far (how many degrees) to turn.  Prefer a translation that has text in common with the translation of 'turn right by'.
BlocklyGames.Msg['Turtle.turnLeft'] = 'turn left by';

/// tooltip
BlocklyGames.Msg['Turtle.widthTooltip'] = 'Changes the width of the pen.';

/// block text - Infinitive or imperative of a verb to set the width of the lines that should be drawn in the future by an imaginary pen.  This is followed by a number indicating the width in pixels (1 or greater).
BlocklyGames.Msg['Turtle.setWidth'] = 'set width to';

/// tooltip - Changes the colour of ink in the pen carried by the turtle.
BlocklyGames.Msg['Turtle.colourTooltip'] = 'Changes the colour of the pen.';

/// block text - Infinitive or imperative of a verb to specify the colour of the lines that should be drawn in the future by an imaginary pen.  This is followed by a block showing the colour
BlocklyGames.Msg['Turtle.setColour'] = 'set colour to';

/// tooltip - Lifting the pen off the writing surface prevents anything from being drawn.  Lowering it (after it has been lifted) enables it to draw again.
BlocklyGames.Msg['Turtle.penTooltip'] = 'Lifts or lowers the pen, to stop or start drawing.';

/// block text - Infinitive or imperative of a verb to lift up a pen so that moving it leaves no mark on the writing surface.
BlocklyGames.Msg['Turtle.penUp'] = 'pen up';

/// block text - Infinitive or imperative of a verb to lower a raised pen so that moving it leaves a mark on the writing surface.
BlocklyGames.Msg['Turtle.penDown'] = 'pen down';

/// tooltip
BlocklyGames.Msg['Turtle.turtleVisibilityTooltip'] = 'Makes the turtle (circle and arrow) visible or invisible.';

/// block text - Infinitive or imperative of a verb telling a turtle to hide itself (become invisible).
BlocklyGames.Msg['Turtle.hideTurtle'] = 'hide turtle';

/// block text - Infinitive or imperative of a verb telling a turtle to show itself (become visible after having been invisible).
BlocklyGames.Msg['Turtle.showTurtle'] = 'show turtle';

/// {{Optional}} The URL of a page with basic information about '''printing''' or '''typography'''.\nMake sure you use secure HTTPS links, to avoid generating mixed contents and security alerts in browsers when viewing the current page in a secure HTTPS session. If not using Wikipedia, make sure the target is non intrusive, but if in doubt, link to a page in another suitable language supported by a Wikimedia project.
BlocklyGames.Msg['Turtle.printHelpUrl'] = 'https://en.wikipedia.org/wiki/Printing';

/// tooltip - Note that 'print' refers to displaying text on the screen, not on an external printer.
BlocklyGames.Msg['Turtle.printTooltip'] = 'Draws text in the turtle\'s direction at its location.';

/// block text - Infinitive or imperative of a verb telling a turtle to display text on the screen.  This is always followed by a block indicating what should be printed.\n{{Identical|Print}}
BlocklyGames.Msg['Turtle.print'] = 'print';

/// {{Optional}} The URL of a page with basic information about '''typographic fonts'''.\nMake sure you use secure HTTPS links, to avoid generating mixed contents and security alerts in browsers when viewing the current page in a secure HTTPS session. If not using Wikipedia, make sure the target is non intrusive, but if in doubt, link to a page in another suitable language supported by a Wikimedia project.
BlocklyGames.Msg['Turtle.fontHelpUrl'] = 'https://en.wikipedia.org/wiki/Font';

/// tooltip - This is shown on the block that lets the user specify the font [family], size, and style that should be used for subsequent displays of text.
BlocklyGames.Msg['Turtle.fontTooltip'] = 'Sets the font used by the print block.';

/// block text - This precedes a dropdown menu specifying the typographic font [family] that should be used when displaying text.\n{{Identical|Font}}
BlocklyGames.Msg['Turtle.font'] = 'font';

/// block text - This precedes a number specifying the size of the typographic font that should be used when displaying text.  This appears in the same block as 'font', so that word should not be repeated.\n{{Identical|Font size}}
BlocklyGames.Msg['Turtle.fontSize'] = 'font size';

/// [[Translating:Blockly#Drop-Down_Menus dropdown]] - Specifies that a typographic font should be normal (neither in italics or bold).
BlocklyGames.Msg['Turtle.fontNormal'] = 'normal';

/// [[Translating:Blockly#Drop-Down_Menus dropdown]] - Specifies that a typographic font should be [https://en.wikipedia.org/wiki/Emphasis_(typography) bold].
BlocklyGames.Msg['Turtle.fontBold'] = 'bold';

/// [[Translating:Blockly#Drop-Down_Menus dropdown]] - Specifies that a typographic font should be [https://en.wikipedia.org/wiki/Italics italic].
BlocklyGames.Msg['Turtle.fontItalic'] = 'italic';

/// Error message.
BlocklyGames.Msg['Turtle.submitDisabled'] = 'Run your program until it stops. Then you may submit your drawing to the gallery.';

/// tooltip - Pressing this button opens a gallery of drawings made by other users.
BlocklyGames.Msg['Turtle.galleryTooltip'] = 'Open the gallery of drawings.';

/// Label on a button that opens a gallery of drawings made by other users.
BlocklyGames.Msg['Turtle.galleryMsg'] = 'See Gallery';

/// tooltip - Pressing this button causes the drawing created by the user's program to be submitted to a gallery for other people to see.
BlocklyGames.Msg['Turtle.submitTooltip'] = 'Submit your drawing to the gallery.';

/// Label on a button that submits the user's art to a public gallery.
BlocklyGames.Msg['Turtle.submitMsg'] = 'Submit to Gallery';

/// Dialog telling user to seek a better answer.
BlocklyGames.Msg['Turtle.helpUseLoop'] = 'Your solution works, but you can do better.';

/// Dialog telling user to seek a simpler answer.
BlocklyGames.Msg['Turtle.helpUseLoop3'] = 'Draw the shape with just three blocks.';

/// Dialog telling user to seek a simpler answer.
BlocklyGames.Msg['Turtle.helpUseLoop4'] = 'Draw the star with just four blocks.';

/// Instructions.
BlocklyGames.Msg['Turtle.helpText1'] = 'Create a program that draws a square.';

/// Instructions.
BlocklyGames.Msg['Turtle.helpText2'] = 'Change your program to draw a pentagon instead of a square.';

/// Introducing a new block.
BlocklyGames.Msg['Turtle.helpText3a'] = 'There\'s a new block that allows you to change the colour:';

/// Instructions.
BlocklyGames.Msg['Turtle.helpText3b'] = 'Draw a yellow star.';

/// Introducing a new block.\n\nCross-reference to ensure consistent terminology:\n* {{msg-blockly|Turtle.penTooltip}}
BlocklyGames.Msg['Turtle.helpText4a'] = 'There\'s a new block that allows you to lift your pen off the paper when you move:';

/// Instructions.
BlocklyGames.Msg['Turtle.helpText4b'] = 'Draw a small yellow star, then draw a line above it.';

/// Instructions.
BlocklyGames.Msg['Turtle.helpText5'] = 'Instead of one star, can you draw four stars arranged in a square?';

/// Instructions.
BlocklyGames.Msg['Turtle.helpText6'] = 'Draw three yellow stars, and one white line.';

/// Instructions.
BlocklyGames.Msg['Turtle.helpText7'] = 'Draw the stars, then draw four white lines.';

/// Instructions.
BlocklyGames.Msg['Turtle.helpText8'] = 'Drawing 360 white lines will look like the full moon.';

/// Instructions.
BlocklyGames.Msg['Turtle.helpText9'] = 'Can you add a black circle so that the moon becomes a crescent?';

/// Instructions.
BlocklyGames.Msg['Turtle.helpText10'] = 'Draw anything you want. You\'ve got a huge number of new blocks you can explore. Have fun!';

/// Instructions on publishing your drawing.
BlocklyGames.Msg['Turtle.helpText10Reddit'] = 'Use the \'See Gallery\' button to see what other people have drawn. If you draw something interesting, use the \'Submit to Gallery\' button to publish it.';

/// Instructions for accessing blocks that are hidden inside categories.
BlocklyGames.Msg['Turtle.helpToolbox'] = 'Choose a category to see the blocks.';

/// Label for an x-coordinate (horizontal) input.
BlocklyGames.Msg['Movie.x'] = 'x';

/// Label for a y-coordinate (vertical) input.
BlocklyGames.Msg['Movie.y'] = 'y';

/// Label for the x-coordinate of the start of a line.
BlocklyGames.Msg['Movie.x1'] = 'start x';

/// Label for the y-coordinate of the start of a line
BlocklyGames.Msg['Movie.y1'] = 'start y';

/// Label for the x-coordinate of the end of a line.
BlocklyGames.Msg['Movie.x2'] = 'end x';

/// Label for the y-coordinate of the end of a line.
BlocklyGames.Msg['Movie.y2'] = 'end y';

/// Label for a circle's radius input.\n{{Identical|Radius}}
BlocklyGames.Msg['Movie.radius'] = 'radius';

/// Label for a rectangle or line's width input.\n{{Identical|Width}}
BlocklyGames.Msg['Movie.width'] = 'width';

/// Label for a rectangle's height input.\n{{Identical|Height}}
BlocklyGames.Msg['Movie.height'] = 'height';

/// tooltip
BlocklyGames.Msg['Movie.circleTooltip'] = 'Draws a circle at the specified location and with the specified radius.';

/// Command to draw a circle.
BlocklyGames.Msg['Movie.circleDraw'] = 'circle';

/// tooltip
BlocklyGames.Msg['Movie.rectTooltip'] = 'Draws a rectangle at the specified location and with the specified width and height.';

/// Command to draw a rectangle.\n{{Identical|Rectangle}}
BlocklyGames.Msg['Movie.rectDraw'] = 'rectangle';

/// tooltip
BlocklyGames.Msg['Movie.lineTooltip'] = 'Draws a line from one point to another with the specified width.';

/// Command to draw a rectangle.\n{{Identical|Line}}
BlocklyGames.Msg['Movie.lineDraw'] = 'line';

/// tooltip
BlocklyGames.Msg['Movie.timeTooltip'] = 'Returns the current time in the animation (0-100).';

/// tooltip - Changes the colour of ink in the pen carried by the turtle.
BlocklyGames.Msg['Movie.colourTooltip'] = 'Changes the colour of the pen.';

/// block text - Infinitive or imperative of a verb to specify the colour of the lines that should be drawn in the future by an imaginary pen.  This is followed by a block showing the colour
BlocklyGames.Msg['Movie.setColour'] = 'set colour to';

/// Error message.
BlocklyGames.Msg['Movie.submitDisabled'] = 'Your movie doesn\'t move. Use blocks to make something interesting. Then you may submit your movie to the gallery.';

/// tooltip - Pressing this button opens a gallery of movies made by other users.
BlocklyGames.Msg['Movie.galleryTooltip'] = 'Open the gallery of movies.';

/// Label on a button that opens a gallery of movies made by other users.
BlocklyGames.Msg['Movie.galleryMsg'] = 'See Gallery';

/// tooltip - Pressing this button causes the movie created by the user's program to be submitted to a gallery for other people to see.
BlocklyGames.Msg['Movie.submitTooltip'] = 'Submit your movie to the gallery.';

/// Label on a button that submits the user's movie to a public gallery.
BlocklyGames.Msg['Movie.submitMsg'] = 'Submit to Gallery';

/// Dialog telling user to change the order of their program.
BlocklyGames.Msg['Movie.helpLayer'] = 'Move the background circle to the top of your program.  Then it will appear behind the person.';

/// Instructions.
BlocklyGames.Msg['Movie.helpText1'] = 'Use simple shapes to draw this person.';

/// Instructions.  The play button looks like the video play button on YouTube.
BlocklyGames.Msg['Movie.helpText2a'] = 'This level is a movie. You want the person\'s arm to move across the screen. Press the play button to see a preview.';

/// Instructions.  Do not translate the word 'time' or the name 'y'.
BlocklyGames.Msg['Movie.helpText2b'] = 'As the movie plays, the value of the \'time\' block counts from 0 to 100. Since you want the \'y\' position of the arm to start at 0 and go to 100 this should be easy.';

/// Instructions.  Do not translate the word 'time' or the name 'y'.
BlocklyGames.Msg['Movie.helpText3'] = 'The \'time\' block counts from 0 to 100. But now you want the \'y\' position of the other arm to start at 100 and go to 0. Can you figure out a simple mathematical formula that flips the direction?';

/// Instructions.
BlocklyGames.Msg['Movie.helpText4'] = 'Use what you learned in the previous level to make legs that cross.';

/// Instructions.
BlocklyGames.Msg['Movie.helpText5'] = 'The mathematical formula for the arm is complicated. Here\'s the answer:';

/// Instructions.  Drawing hands on a picture of a person.
BlocklyGames.Msg['Movie.helpText6'] = 'Give the person a couple of hands.';

/// Instructions.  Do translate the word 'if'.
BlocklyGames.Msg['Movie.helpText7'] = 'Use the \'if\' block to draw a small head for the first half of the movie. Then draw a big head for the second half of the movie.';

/// Instructions.
BlocklyGames.Msg['Movie.helpText8'] = 'Make the legs reverse direction half way through the movie.';

/// Instructions.
BlocklyGames.Msg['Movie.helpText9'] = 'Draw an expanding circle behind the person.';

/// Instructions.
BlocklyGames.Msg['Movie.helpText10'] = 'Make a movie of anything you want. You\'ve got a huge number of new blocks you can explore. Have fun!';

/// Instructions on publishing your movie.
BlocklyGames.Msg['Movie.helpText10Reddit'] = 'Use the \'See Gallery\' button to see movies that other people have made. If you make an interesting movie, use the \'Submit to Gallery\' button to publish it.';

/// tooltip
BlocklyGames.Msg['Music.playNoteTooltip'] = 'Plays one musical note of the specified duration and pitch.';

/// Plays one musical note.  %1 is duration of the note (icon for whole, quarter, ...), %2 is the pitch of the note (A3, B3, C4, ...).
BlocklyGames.Msg['Music.playNote'] = 'play %1 note %2';

/// tooltip
BlocklyGames.Msg['Music.restTooltip'] = 'Waits for the specified duration.';

/// tooltip
BlocklyGames.Msg['Music.restWholeTooltip'] = 'Waits for one whole note.';

/// Plays no music for a duration specified.  %1 is the duration (icon for whole, quarter, ...).
BlocklyGames.Msg['Music.rest'] = 'rest %1';

/// tooltip
BlocklyGames.Msg['Music.setInstrumentTooltip'] = 'Switches to the specified instrument when playing subsequent musical notes.';

/// Sets to an instrument to play music.  %1 is type of the instrument (guitar, piano, ...).
BlocklyGames.Msg['Music.setInstrument'] = 'set instrument to %1';

/// tooltip
BlocklyGames.Msg['Music.startTooltip'] = 'Executes the blocks inside when the \'Run Program\' button is clicked.';

/// The program associated with this label is executed when a button is clicked.  %1 is image of the play icon on the button.
BlocklyGames.Msg['Music.start'] = 'when %1 clicked';

/// tooltip - Describes a musical note selector.  'C4' (also known as 'DO') is the note in the center of a piano keyboard and is represented as the number 7.
BlocklyGames.Msg['Music.pitchTooltip'] = 'One note (C4 is 7).';

/// Example name of a function that plays the first part of some music.
BlocklyGames.Msg['Music.firstPart'] = 'first part';

/// Name of musical instrument.\n{{Identical|piano}}
BlocklyGames.Msg['Music.piano'] = 'piano';

/// Name of musical instrument.\n{{Identical|trumpet}}
BlocklyGames.Msg['Music.trumpet'] = 'trumpet';

/// Name of musical instrument.\n{{Identical|banjo}}
BlocklyGames.Msg['Music.banjo'] = 'banjo';

/// Name of musical instrument.\n{{Identical|violin}}
BlocklyGames.Msg['Music.violin'] = 'violin';

/// Name of musical instrument.\n{{Identical|guitar}}
BlocklyGames.Msg['Music.guitar'] = 'guitar';

/// Name of musical instrument.\n{{Identical|flute}}
BlocklyGames.Msg['Music.flute'] = 'flute';

/// Name of musical instrument.\n{{Identical|drum}}
BlocklyGames.Msg['Music.drum'] = 'drum';

/// Name of musical instrument.\n{{Identical|choir}}
BlocklyGames.Msg['Music.choir'] = 'choir';

/// Error message.
BlocklyGames.Msg['Music.submitDisabled'] = 'Run your program until it stops. Then you may submit your music to the gallery.';

/// tooltip - Pressing this button opens a gallery of music made by other users.
BlocklyGames.Msg['Music.galleryTooltip'] = 'Open the gallery of music.';

/// Label on a button that opens a gallery of music made by other users.
BlocklyGames.Msg['Music.galleryMsg'] = 'See Gallery';

/// tooltip - Pressing this button causes the music created by the user's program to be submitted to a gallery for other people to see.
BlocklyGames.Msg['Music.submitTooltip'] = 'Submit your music to the gallery.';

/// Label on a button that submits the user's art to a public gallery.
BlocklyGames.Msg['Music.submitMsg'] = 'Submit to Gallery';

/// Dialog telling user to seek a better answer.
BlocklyGames.Msg['Music.helpUseFunctions'] = 'Your solution works, but you can do better.  Use functions to reduce the amount of repeated code.';

/// Dialog telling user not to use only one musical instrument (piano, flute, etc).
BlocklyGames.Msg['Music.helpUseInstruments'] = 'The music will sound better if you use a different instrument in each start block.';

/// Instructions.  If your country has a song to the tune of 'Frère Jacques' use its name.  E.g. Bruder Jakob (German) or Kìa con bướm (Vietnamese).
BlocklyGames.Msg['Music.helpText1'] = 'Compose the first four notes of \'Frère Jacques\'.';

/// Introducing a new block: function or subroutines
BlocklyGames.Msg['Music.helpText2a'] = 'A \'function\' allows you to group blocks together, then run them more than once.';

/// Instructions.
BlocklyGames.Msg['Music.helpText2b'] = 'Create a function to play the first four notes of \'Frère Jacques\'. Run that function twice.  Don\'t add any new note blocks.';

/// Instructions.
BlocklyGames.Msg['Music.helpText3'] = 'Create a second function for the next part of \'Frère Jacques\'. The last note is longer.';

/// Instructions.
BlocklyGames.Msg['Music.helpText4'] = 'Create a third function for the next part of \'Frère Jacques\'. The first four notes are shorter.';

/// Instructions.
BlocklyGames.Msg['Music.helpText5'] = 'Complete the full tune of \'Frère Jacques\'.';

/// Introducing a new block that changes musical instruments.
BlocklyGames.Msg['Music.helpText6a'] = 'This new block lets you change to another instrument.';

/// Instructions.
BlocklyGames.Msg['Music.helpText6b'] = 'Play your tune with a violin.';

/// Introducing a new block: a musical rest.
BlocklyGames.Msg['Music.helpText7a'] = 'This new block adds a silent delay.';

/// Instructions.
BlocklyGames.Msg['Music.helpText7b'] = 'Create a second start block that has two delay blocks, then also plays \'Frère Jacques\'.';

/// Instructions.
BlocklyGames.Msg['Music.helpText8'] = 'Each start block should play \'Frère Jacques\' twice.';

/// Instructions.
BlocklyGames.Msg['Music.helpText9'] = 'Create four start blocks that each play \'Frère Jacques\' twice. Add the correct number of delay blocks.';

/// Instructions.
BlocklyGames.Msg['Music.helpText10'] = 'Compose anything you want. You\'ve got a huge number of new blocks you can explore. Have fun!';

/// Instructions on publishing your music.
BlocklyGames.Msg['Music.helpText10Reddit'] = 'Use the \'See Gallery\' button to see what other people have composed. If you compose something interesting, use the \'Submit to Gallery\' button to publish it.';

/// Tooltip for the block that allows players to scan for enemies.
BlocklyGames.Msg['Pond.scanTooltip'] = 'Scan for enemies. Specify a direction (0-360). Returns the distance to the closest enemy in that direction. Returns Infinity if no enemy found.';

/// Tooltip for the block that allows players to shoot at other players.
BlocklyGames.Msg['Pond.cannonTooltip'] = 'Fire the cannon. Specify a direction (0-360) and a range (0-70).';

/// Tooltip for the block that allows players to move.
BlocklyGames.Msg['Pond.swimTooltip'] = 'Swim forward. Specify a direction (0-360).';

/// Tooltip for the block that allows players to stop.
BlocklyGames.Msg['Pond.stopTooltip'] = 'Stop swimming. Player will slow to a stop.';

/// Tooltip for the block that reports the player's health.
BlocklyGames.Msg['Pond.healthTooltip'] = 'Returns the player\'s current health (0 is dead, 100 is healthy).';

/// Tooltip for the block that reports the player's speed.
BlocklyGames.Msg['Pond.speedTooltip'] = 'Returns the current speed of the player (0 is stopped, 100 is full speed).';

/// Tooltip for the block that reports the player's horizontal location.
BlocklyGames.Msg['Pond.locXTooltip'] = 'Returns the X coordinate of the player (0 is the left edge, 100 is the right edge).';

/// Tooltip for the block that reports the player's vertical location.
BlocklyGames.Msg['Pond.locYTooltip'] = 'Returns the Y coordinate of the player (0 is the bottom edge, 100 is the top edge).';

/// Tooltip for the block that prints debugging information.
BlocklyGames.Msg['Pond.logTooltip'] = 'Prints a number to your browser\'s console.';

/// Tooltip for the button that opens the language reference documentation.
BlocklyGames.Msg['Pond.docsTooltip'] = 'Display the language documentation.';

/// Text on the button that opens the language reference documentation.\n{{Identical|Documentation}}
BlocklyGames.Msg['Pond.documentation'] = 'Documentation';

/// Generic name for the player of this video game.\n{{Identical|Player}}
BlocklyGames.Msg['Pond.playerName'] = 'Player';

/// Name for a player that does nothing.\n{{Identical|Target}}
BlocklyGames.Msg['Pond.targetName'] = 'Target';

/// Name for a player that moves back and forth.\n{{Identical|Pendulum}}
BlocklyGames.Msg['Pond.pendulumName'] = 'Pendulum';

/// Name for a player that is scared.\n{{Identical|Scared}}
BlocklyGames.Msg['Pond.scaredName'] = 'Scared';

/// Dialog telling user to seek a better answer.  Do not translate the word 'scan'.
BlocklyGames.Msg['Pond.helpUseScan'] = 'Your solution works, but you can do better. Use \'scan\' to tell the cannon how far to shoot.';

/// Instructions. Do not translate the word 'cannon'.
BlocklyGames.Msg['Pond.helpText1'] = 'Use the \'cannon\' command to hit the target. The first parameter is the angle, the second parameter is the range. Find the right combination.';

/// Instructions.  Do not translate 'while (true)'.
BlocklyGames.Msg['Pond.helpText2'] = 'This target needs to be hit many times. Use a \'while (true)\' loop to do something indefinitely.';

/// Instructions.  Do not translate 'scan'.
BlocklyGames.Msg['Pond.helpText3a'] = 'This opponent moves back and forth, making it hard to hit. The \'scan\' expression returns the exact range to the opponent in the specified direction.';

/// Instructions.  Do not translate 'cannon'.
BlocklyGames.Msg['Pond.helpText3b'] = 'This range is exactly what the \'cannon\' command needs to fire accurately.';

/// Instructions.  Do not translate the word 'swim'.
BlocklyGames.Msg['Pond.helpText4'] = 'This opponent is too far away to use the cannon (which has a limit of 70 meters). Instead, use the \'swim\' command to start swimming towards the opponent and crash into it.';

/// Instructions.  Do not translate the word 'stop'.
BlocklyGames.Msg['Pond.helpText5'] = 'This opponent is also too far away to use the cannon. But you are too weak to survive a collision. Swim towards the opponent while your horizontal location is less than than 50. Then \'stop\' and use the cannon.';

/// Instructions.
BlocklyGames.Msg['Pond.helpText6'] = 'This opponent will move away when it is hit. Swim towards it if it is out of range (70 meters).';

/// Display of art created by user's programs.\n{{Identical|Gallery}}
BlocklyGames.Msg['Gallery'] = 'Gallery';
