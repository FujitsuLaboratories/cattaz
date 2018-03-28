# Kanban application

You can drag-and-drop kanban cards to organize your tasks.

## Application

```kanban
* TODO
  * task 1
  * **task 2**
  * task 3
* DOING
  * *task 4*
  * task 5
* DONE
  * task 6
  * Add kanban to [app list](#/doc/apps)
```

## Usage

* To add list or card, input a name and click 'add' button.
* To move list or card, drag-and-drop it.
* To remove list or card, drag it and drop to 'Drop here to remove'.

## Data format

Kanban application uses Markdown format. Markdown should be a nested unordered list and its depth should be two.

It also understands Markdown emphasises, e.g. `*empasis 1*`, `**empasis 2**`, and `***empasis 3***`. Emphasised items will be colored.
Emphasises should be applied to whole text.

Text may include Markdown links.
