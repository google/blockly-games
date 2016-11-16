/**
 * AccessibleBlockly
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Angular2 Data for the house game.
 * @author fraser@google.com (Neil Fraser)
 */

var houseData = [{
  name: 'Upper Floor',
  contents: [{
    name: 'Bedroom',
    contents: [{
      name: 'Bed',
      actions: [{
        name: 'sleep on bed',
        alert: 'You take a nap and wake up refreshed.'
      }, {
        name: 'pick up bed',
        alert: 'The bed is too heavy to pick up.'
      }]
    }, {
      name: 'Lamp',
      actions: [{
        name: 'turn on lamp',
        alert: 'You turn on the lamp and look around the room.  It is pretty messy.'
      }]
    }]
  }, {
    name: 'Nursery',
    contents: [{
      name: 'Crib',
      actions: [{
        name: 'sleep in crib',
        alert: 'You are too big to fit in the crib.'
      }, {
        name: 'pick up crib',
        alert: 'The crib is too heavy to pick up.'
      }]
    }, {
      name: 'Baby',
      actions: [{
        name: 'play with baby',
        alert: 'You play with the baby and she giggles.',
        levelSolved: 2
      }, {
        name: 'change diaper',
        alert: 'You change the baby\'s diaper.  She smells much better now.'
      }, {
        name: 'pick up baby',
        alert: 'You pick up the baby, but she starts crying and throws up on you.  You put her back down.'
      }]
    }]
  }, {
    name: 'Bathroom',
    contents: [{
      name: 'Bathtub',
      actions: [{
        name: 'take a bath',
        alert: 'You fill the bathtub with water, take a bath, then dry off.'
      }, {
        name: 'clean bathtub',
        alert: 'The bathtub was quite dirty, you clean it up so it shines.'
      }, {
        name: 'pick up bathtub',
        alert: 'Seriously? The bathtub is far too heavy to pick up.'
      }]
    }, {
      name: 'Toilet',
      actions: [{
        name: 'flush toilet',
        alert: 'You flush the toilet and it makes a gurgling noise.',
        levelSolved: 3
      }, {
        name: 'clean toilet',
        alert: 'The toilet was quite dirty, you clean it up so it shines.'
      }, {
        name: 'pick up toilet',
        alert: 'The toilet is bolted to the floor, you can\'t pick it up.'
      }]
    }]
  }]
}, {
  name: 'Ground Floor',
  contents: [{
    name: 'Living Room',
    contents: [{
      name: 'Sofa',
      actions: [{
        name: 'sit on sofa',
        alert: 'You sit in the sofa and sink deeply into the soft cushions.'
      }, {
        name: 'pick up sofa',
        alert: 'The sofa is too heavy to pick up.'
      }]
    }, {
      name: 'Cat',
      actions: [{
        name: 'pet cat',
        alert: 'You stroke the cat.  He rolls over and purrs happily.'
      }, {
        name: 'feed cat',
        alert: 'You give a can of tuna to the cat.  He eats it quickly and looks around for more.',
        levelSolved: 0
      }, {
        name: 'pick up cat',
        alert: 'The cat screaches, scratches your arm, and runs under the sofa.'
      }]
    }]
  }, {
    name: 'Kitchen',
    contents: [{
      name: 'Refrigerator',
      actions: [{
        name: 'look in refrigerator',
        alert: 'You open the refrigerator and look inside.  It is filled with tuna.  Presumably for the cat.'
      }, {
        name: 'pick up refrigerator',
        alert: 'There is too much salmon inside, making the refrigerator too heavy to pick up.'
      }]
    }]
  }, {
    name: 'Garage',
    contents: [{
      name: 'Car',
      actions: [{
        name: 'start car',
        alert: 'You find the keys and start the car.  But you turn it off quickly to avoid carbon-monoxide poisoning.'
      }, {
        name: 'wash car',
        alert: 'You use soap and water to wash the car.  Now it is nice and shiny.',
        levelSolved: 1
      }, {
        name: 'pick up car',
        alert: 'The car is too heavy to pick up.'
      }]
    }]
  }]
}, {
  name: 'Basement',
  contents: [{
    name: 'Box #1',
    actions: [{
      name: 'look in box',
      alert: 'This box is filled with Christmas decorations.'
    }]
  }, {
    name: 'Box #2',
    actions: [{
      name: 'look in box',
      alert: 'This box is filled with family photographs.',
      levelSolved: 4
    }]
  }, {
    name: 'Box #3',
    actions: [{
      name: 'look in box',
      alert: 'This box is filled with old clothes.'
    }]
  }]
}];
