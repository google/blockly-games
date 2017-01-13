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
 * @fileoverview Angular2 Service that handles tree keyboard navigation.
 * This is a singleton service for the entire application.
 *
 * @author sll@google.com (Sean Lip)
 */

houseApp.TreeService = ng.core
  .Class({
    constructor: [
        houseApp.NotificationsService, function(_notificationsService) {
      // Stores active descendant ids for each tree in the page.
      this.activeDescendantIds_ = {};
      this.notificationsService = _notificationsService;
    }],
    // Returns a list of all top-level workspace tree nodes on the page.
    getWorkspaceTreeNodes_: function() {
      return Array.from(document.querySelectorAll('ol.blocklyWorkspaceTree'));
    },
    // Returns a list of all top-level tree nodes on the page.
    getAllTreeNodes_: function() {
      var treeNodes = [this.getWorkspaceTreeNodes_()];
      return treeNodes;
    },
    isTopLevelWorkspaceTree: function(treeId) {
      return this.getWorkspaceTreeNodes_().some(function(tree) {
        return tree.id == treeId;
      });
    },
    focusOnCurrentTree_: function(treeId) {
      var trees = this.getAllTreeNodes_();
      for (var i = 0; i < trees.length; i++) {
        if (trees[i].id == treeId) {
          trees[i].focus();
          return trees[i].id;
        }
      }
      return null;
    },
    getIdOfNextTree_: function(treeId) {
      var trees = this.getAllTreeNodes_();
      for (var i = 0; i < trees.length - 1; i++) {
        if (trees[i].id == treeId) {
          return trees[i + 1].id;
        }
      }
      return null;
    },
    getIdOfPreviousTree_: function(treeId) {
      var trees = this.getAllTreeNodes_();
      for (var i = trees.length - 1; i > 0; i--) {
        if (trees[i].id == treeId) {
          return trees[i - 1].id;
        }
      }
      return null;
    },
    getActiveDescId: function(treeId) {
      return this.activeDescendantIds_[treeId] || '';
    },
    unmarkActiveDesc_: function(activeDescId) {
      var activeDesc = document.getElementById(activeDescId);
      if (activeDesc) {
        activeDesc.classList.remove('blocklyActiveDescendant');
      }
    },
    markActiveDesc_: function(activeDescId) {
      var newActiveDesc = document.getElementById(activeDescId);
      newActiveDesc.classList.add('blocklyActiveDescendant');
    },
    // This clears the active descendant of the given tree. It is used just
    // before the tree is deleted.
    clearActiveDesc: function(treeId) {
      this.unmarkActiveDesc_(this.getActiveDescId(treeId));
      delete this.activeDescendantIds_[treeId];
    },
    // Make a given node the active descendant of a given tree.
    setActiveDesc: function(newActiveDescId, treeId) {
      this.unmarkActiveDesc_(this.getActiveDescId(treeId));
      this.markActiveDesc_(newActiveDescId);
      this.activeDescendantIds_[treeId] = newActiveDescId;

      // Scroll the new active desc into view, if needed. This has no effect
      // for blind users, but is helpful for sighted onlookers.
      var activeDescNode = document.getElementById(newActiveDescId);
      var documentNode = document.body || document.documentElement;
      if (activeDescNode.offsetTop < documentNode.scrollTop ||
          activeDescNode.offsetTop >
              documentNode.scrollTop + window.innerHeight) {
        window.scrollTo(0, activeDescNode.offsetTop);
      }
    },
    initActiveDesc: function(treeId) {
      // Set the active desc to the first child in this tree.
      var tree = document.getElementById(treeId);
      this.setActiveDesc(this.getFirstChild(tree).id, treeId);
    },
    isButtonOrFieldNode_: function(node) {
      return ['BUTTON', 'INPUT'].indexOf(node.tagName) != -1;
    },
    getNextActiveDescWhenBlockIsDeleted: function(blockRootNode) {
      // Go up a level, if possible.
      var nextNode = blockRootNode.parentNode;
      while (nextNode && nextNode.tagName != 'LI') {
        nextNode = nextNode.parentNode;
      }
      if (nextNode) {
        return nextNode;
      }

      // Otherwise, go to the next sibling.
      var nextSibling = this.getNextSibling(blockRootNode);
      if (nextSibling) {
        return nextSibling;
      }

      // Otherwise, go to the previous sibling.
      var previousSibling = this.getPreviousSibling(blockRootNode);
      if (previousSibling) {
        return previousSibling;
      }

      // Otherwise, this is a top-level isolated block, which means that
      // something's gone wrong and this function should not have been called
      // in the first place.
      console.error('Could not handle deletion of block.' + blockRootNode);
    },
    notifyUserAboutCurrentTree_: function(treeId) {
      var workspaceTreeNodes = this.getWorkspaceTreeNodes_();
      for (var i = 0; i < workspaceTreeNodes.length; i++) {
        if (workspaceTreeNodes[i].id == treeId) {
          this.notificationsService.setStatusMessage(
              'Now in workspace group ' + (i + 1) + ' of ' +
              workspaceTreeNodes.length);
        }
      }
    },
    onKeypress: function(e, tree) {
      var treeId = tree.id;
      var activeDesc = document.getElementById(this.getActiveDescId(treeId));
      if (!activeDesc) {
        console.error('ERROR: no active descendant for current tree.');
        this.initActiveDesc(treeId);
        return;
      }

      if (e.altKey) {
        // Do not intercept combinations such as Alt+Home.
        return;
      }

      // Outside an input field, Enter, Tab and navigation keys are all
      // recognized.
      if (e.keyCode == 13) {
        // Enter key. The user wants to interact with a button, interact with
        // an input field, or move down one level.
        // Algorithm to find the field: do a DFS through the children until
        // we find an INPUT or BUTTON element (in which case we use it).
        // Truncate the search at child LI elements.
        var found = false;
        var dfsStack = Array.from(activeDesc.children);
        while (dfsStack.length) {
          var currentNode = dfsStack.shift();
          if (currentNode.tagName == 'BUTTON') {
            this.moveUpOneLevel_(treeId);
            currentNode.click();
            found = true;
            break;
          } else if (currentNode.tagName == 'LI') {
            continue;
          }

          if (currentNode.children) {
            var reversedChildren = Array.from(currentNode.children).reverse();
            reversedChildren.forEach(function(childNode) {
              dfsStack.unshift(childNode);
            });
          }
        }

        // If we cannot find a field to interact with, we try moving down a
        // level instead.
        if (!found) {
          this.moveDownOneLevel_(treeId);
        }
      } else if (e.keyCode == 9) {
        // Tab key. Note that allowing the event to propagate through is
        // intentional.
        var destinationTreeId =
            e.shiftKey ? this.getIdOfPreviousTree_(treeId) :
            this.getIdOfNextTree_(treeId);
        if (destinationTreeId) {
          this.notifyUserAboutCurrentTree_(destinationTreeId);
        }
      } else if (e.keyCode == 27) {
        this.moveUpOneLevel_(treeId);
      } else if (e.keyCode >= 35 && e.keyCode <= 40) {
        // End, home, and arrow keys.
        if (e.keyCode == 35) {
          // End key. Go to the last sibling in the subtree.
          var finalSibling = this.getFinalSibling(activeDesc);
          if (finalSibling) {
            this.setActiveDesc(finalSibling.id, treeId);
          }
        } else if (e.keyCode == 36) {
          // Home key. Go to the first sibling in the subtree.
          var initialSibling = this.getInitialSibling(activeDesc);
          if (initialSibling) {
            this.setActiveDesc(initialSibling.id, treeId);
          }
        } else if (e.keyCode == 37) {
          // Left arrow key. Go up a level, if possible.
          this.moveUpOneLevel_(treeId);
        } else if (e.keyCode == 38) {
          // Up arrow key. Go to the previous sibling, if possible.
          var prevSibling = this.getPreviousSibling(activeDesc);
          if (prevSibling) {
            this.setActiveDesc(prevSibling.id, treeId);
          } else {
            var statusMessage = 'Reached top of list.';
            if (this.getParentListElement_(activeDesc)) {
              statusMessage += ' Press left to go to parent list.';
            }
            this.notificationsService.setStatusMessage(statusMessage);
          }
        } else if (e.keyCode == 39) {
          // Right arrow key. Go down a level, if possible.
          this.moveDownOneLevel_(treeId);
        } else if (e.keyCode == 40) {
          // Down arrow key. Go to the next sibling, if possible.
          var nextSibling = this.getNextSibling(activeDesc);
          if (nextSibling) {
            this.setActiveDesc(nextSibling.id, treeId);
          } else {
            this.notificationsService.setStatusMessage(
                'Reached bottom of list.');
          }
        }

        e.preventDefault();
        e.stopPropagation();
      }
    },
    moveDownOneLevel_: function(treeId) {
      var activeDesc = document.getElementById(this.getActiveDescId(treeId));
      var firstChild = this.getFirstChild(activeDesc);
      if (firstChild) {
        this.setActiveDesc(firstChild.id, treeId);
      }
    },
    moveUpOneLevel_: function(treeId) {
      var activeDesc = document.getElementById(this.getActiveDescId(treeId));
      var nextNode = this.getParentListElement_(activeDesc);
      if (nextNode) {
        this.setActiveDesc(nextNode.id, treeId);
      }
    },
    getParentListElement_: function(element) {
      var nextNode = element.parentNode;
      while (nextNode && nextNode.tagName != 'LI') {
        nextNode = nextNode.parentNode;
      }
      return nextNode;
    },
    getFirstChild: function(element) {
      if (!element) {
        return element;
      } else {
        var childList = element.children;
        for (var i = 0; i < childList.length; i++) {
          if (childList[i].tagName == 'LI') {
            return childList[i];
          } else {
            var potentialElement = this.getFirstChild(childList[i]);
            if (potentialElement) {
              return potentialElement;
            }
          }
        }
        return null;
      }
    },
    getFinalSibling: function(element) {
      while (true) {
        var nextSibling = this.getNextSibling(element);
        if (nextSibling && nextSibling.id != element.id) {
          element = nextSibling;
        } else {
          return element;
        }
      }
    },
    getInitialSibling: function(element) {
      while (true) {
        var previousSibling = this.getPreviousSibling(element);
        if (previousSibling && previousSibling.id != element.id) {
          element = previousSibling;
        } else {
          return element;
        }
      }
    },
    getNextSibling: function(element) {
      if (element.nextElementSibling) {
        // If there is a sibling, find the list element child of the sibling.
        var node = element.nextElementSibling;
        if (node.tagName == 'LI') {
          return node;
        } else {
          // getElementsByTagName returns in DFS order, therefore the first
          // element is the first relevant list child.
          return node.getElementsByTagName('li')[0];
        }
      } else {
        var parent = element.parentNode;
        while (parent && parent.tagName != 'OL') {
          if (parent.nextElementSibling) {
            var node = parent.nextElementSibling;
            if (node.tagName == 'LI') {
              return node;
            } else {
              return this.getFirstChild(node);
            }
          } else {
            parent = parent.parentNode;
          }
        }
        return null;
      }
    },
    getPreviousSibling: function(element) {
      if (element.previousElementSibling) {
        var sibling = element.previousElementSibling;
        if (sibling.tagName == 'LI') {
          return sibling;
        } else {
          return this.getLastChild(sibling);
        }
      } else {
        var parent = element.parentNode;
        while (parent) {
          if (parent.tagName == 'OL') {
            break;
          }
          if (parent.previousElementSibling) {
            var node = parent.previousElementSibling;
            if (node.tagName == 'LI') {
              return node;
            } else {
              // Find the last list element child of the sibling of the parent.
              return this.getLastChild(node);
            }
          } else {
            parent = parent.parentNode;
          }
        }
        return null;
      }
    },
    getLastChild: function(element) {
      if (!element) {
        return element;
      } else {
        var childList = element.children;
        for (var i = childList.length - 1; i >= 0; i--) {
          // Find the last child that is a list element.
          if (childList[i].tagName == 'LI') {
            return childList[i];
          } else {
            var potentialElement = this.getLastChild(childList[i]);
            if (potentialElement) {
              return potentialElement;
            }
          }
        }
        return null;
      }
    }
});
