# coherent-cli

A command line interface for developing Coherent Gameface and Prysm projects

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/coherent-cli.svg)](https://npmjs.org/package/coherent-cli)
[![Downloads/week](https://img.shields.io/npm/dw/coherent-cli.svg)](https://npmjs.org/package/coherent-cli)
[![License](https://img.shields.io/npm/l/coherent-cli.svg)](https://github.com/https://github.com/orgs/CoherentLabs/coherent-cli/blob/master/package.json)

<!-- toc -->

- [coherent-cli](#coherent-cli)
- [Installation](#installation)
- [Commands](#commands)
  - [Available commands](#available-commands)
  - [coherent-cli create](#coherent-cli-create)
    - [Usage](#usage)
    - [Options](#options)
      - [`--type`](#--type)
      - [`--default`](#--default)
      - [`--config`](#--config)
  - [coherent-cli create-mock-model](#coherent-cli-create-mock-model)
    - [Usage](#usage-1)
  - [coherent-cli lint](#coherent-cli-lint)
    - [Usage](#usage-2)
    - [Options](#options-1)
      - [`--watch`](#--watch)
      - [`--fileName`](#--filename)
  - [coherent-cli player](#coherent-cli-player)
    - [Usage](#usage-3)
    - [Options](#options-2)
      - [`--update`](#--update)
      - [`--config`](#--config-1)
    <!-- tocstop -->

# Installation

```sh-session
npm install -g coherent-cli
```

Or you can use:

```
npx coherent-cli <COMMAND>
```

# Commands

<!-- commands -->

To view a list of all available commands you can do:

```
coherent-cli help
```

To see a list of available options for a command you can do:

```
coherent-cli <COMMAND> --help
```

## Available commands

-   [`coherent-cli create`](#coherent-cli-create)
-   [`coherent-cli create-mock-model`](#coherent-cli-create-mock-model)
-   [`coherent-cli lint`](#coherent-cli-lint)
-   [`coherent-cli player`](#coherent-cli-player)

## coherent-cli create

Creates boilerplates for Vanilla JS and React projects

### Usage

```
coherent-cli create <PROJECT_NAME>
```

For example:

```
coherent-cli create my-app
```

When started it will prompt you to choose from a number of options to customize your project. After the command is done it will generate your boilerplate in the `<PROJECT_NAME>` folder.

An important thing to note is that this CLI will create a config file called `coh-config.json` which will be used by all of the other commands in the CLI.

### Options

#### `--type`

Chooses the type of project you want to create and shows the appropriate prompts. This flag is optional, not providing it will prompt you to choose the type when creating the project.

Available options are `no-framework` and `react`

```
coherent-cli create my-app --type react
```

#### `--default`

Creates a default boilerplate. This flag only works in conjuction with the `--type` flag. When you create a default boilerplate you will be prompted to choose if you want this to be a Gameface/Prysm UI project. Afterwards it will skip all of the other prompts.

```
coherent-cli create my-app --type react --default
```

#### `--config`

This flag allows you to pass the path to a `coh-config.json` file in order to copy the configuration of a boilerplate. When choosing to use a config all other flags will be ignored.

```
coherent-cli create my-app --config ./coh-config.json
```

## coherent-cli create-mock-model

This command allows you to create mock Gameface/Prysm models quickly. For more information about mocking models you can [read here](https://coherent-labs.com/Documentation/cpp-gameface/da/d45/data_binding__j_s.html)

**_Note: This command requires a valid coh-config.json with a correct path to a Gameface/Prysm package_**

### Usage

```
coherent-cli create-mock-model <MODEL_NAME>
```

For example

```
coherent-cli create-mock-model MockedModel
```

will create a file called `model.js` in the root of your project and add the following code inside

```
engine.on("Ready", () => {
    engine.createJSModel("MockedModel", {});

    engine.synchronizeModels();
});
```

which you can then edit to add your model properties

If you use the `create-mock-model` command with a different name, it will add the new model to the `model.js` file

_Warning: If you have moved the generated model file to another location, a new `model.js` file will be created when using the command._

## coherent-cli lint

Runs the Coherent [CSS](https://coherent-labs.com/Documentation/cpp-gameface/dc/de0/css_linting.html) and [HTML](https://coherent-labs.com/Documentation/cpp-gameface/d0/d25/html_linting.html) linter in your project, without needing to configure them locally

**_Note: This command requires a valid coh-config.json with a correct path to a Gameface/Prysm package_**

### Usage

```
coherent-cli lint <FILE_TYPE>
```

You can lint either `css` or `html` file types

For example:

```
coherent-cli lint css
```

### Options

#### `--watch`

Watches selected file types for changes and lints them afterwards

```
coherent-cli lint css --watch
```

#### `--fileName`

Allows you to lint a single file instead. This flag doesn't work if it's used alongside the `--watch` flag

```
coherent-cli lint css --fileName ./style.css
```

## coherent-cli player

Opens the [Player.exe](https://coherent-labs.com/Documentation/cpp-gameface/d8/db6/player.html) with a file or URL

**_Note: This command requires a valid coh-config.json with a correct path to a Gameface/Prysm package.
This command works only on Windows at the moment_**

### Usage

```
coherent-cli player <FILE_NAME|URL>
```

You need to provide a HTML file or valid URL(must start with the http or https protocol) which will be opened by the Player

For example:

```
coherent-cli player ./index.html

coherent-cli player http://localhost:8080
```

### Options

#### `--update`

This flag allows you to update the package location in the `coh-config.json` file.

```
coherent-cli player --update
```

You can use this flag without providing a file or URL, however if you choose to add them you will first be prompted to change the package location and then they will be opened from the new location

#### `--config`

This flag allows you to pass a path to the `coh-config.json` file.

```
coherent-cli player --config ./coh-config.json ./index.html
```

<!-- commandsstop -->
