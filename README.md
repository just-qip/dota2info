# Dota2info

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.24.

```asciidoc
<!-- На любом сайте -->
<script src="https://dota2info.com/widget/elements.js" type="module"></script>

<dota-item-icon item-id="tango" display-name="Tango"></dota-item-icon>

<dota-hero-icon hero-id="antimage" display-name="Anti-Mage"></dota-hero-icon>

<dota-ability-icon
ability-id="antimage_mana_break"
display-name="Mana Break"
></dota-ability-icon>
```

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
npm run build
```

## Make docker image

```bash
docker build -t dota2info .

for local running:
docker run -d -p 8080:80 --name dota2info dota2info
```

To build the project run:

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
