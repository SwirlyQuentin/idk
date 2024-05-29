# astro-steelanvil-starter

This is a template for creating a simple site using Astro. It includes features like SSR (Server-Side Rendering), importing nanostores in script tags, using seedrandom for random number generation, and connecting to Firebase using a .env file.

## Installation

1. Make sure you have Node.js installed on your machine.
2. Clone this repository to your local machine.
3. Install the dependencies by running the following command:

   ```bash
   npm install
   ```

## Usage

### Directory Structure

- The markdown files for your blog posts should be placed in the `src/posts` directory.

### SSR Configuration

- To enable SSR (Server-Side Rendering), open the `astro.config.mjs` file and set the `ssr` option to `true`.

### Importing nanostores

- To import nanostores in script tags, you can use the following syntax:
    
    ```html
    <script type="module">
      import { createStore } from 'nanostores';
      // Your code here
    </script>
    ```
    

### Using seedrandom for random number generation

- To use seedrandom for random number generation, you can import it in your JavaScript file like this:
    
    ```javascript
    import seedrandom from 'seedrandom';
    // Your code here
    ```
    

### Using Firebase connection with a .env file

- To use Firebase in your project, follow these steps:
    
    1. Create a `.env` file in the root directory of your project.
        
    2. Add your Firebase configuration details to the `.env` file. For example:
        
        ```
        FIREBASE_API_KEY=your-api-key
        FIREBASE_AUTH_DOMAIN=your-auth-domain
        FIREBASE_PROJECT_ID=your-project-id
        ```
        
    3. In your JavaScript file, you can access the Firebase configuration using `process.env`.
        
        ```javascript
        const firebaseConfig = {
          apiKey: process.env.FIREBASE_API_KEY,
          authDomain: process.env.FIREBASE_AUTH_DOMAIN,
          projectId: process.env.FIREBASE_PROJECT_ID,
        };
        // Your code here
        ```
        

## Scripts

- `npm run dev` or `npm start`: Starts the development server.
- `npm run build`: Builds the production-ready files.
- `npm run preview`: Previews the production build locally.
- `npm run astro`: Runs the Astro CLI commands.
