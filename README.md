# Aardvark React Apps
React components for Magento frontend

## Requirements
- Node.js (https://nodejs.org/en/)
- Create React App (https://facebook.github.io/create-react-app/docs/getting-started)

## Development
- Execute `npm run start`
- Open http://localhost:3000/ in your web browser and start developing 

## Deployment

- Execute `npm run build`
- Copy content of the `./build` folder to `magento/js/aardvark/react-apps`
- Commit all news files in the Magento repository
- Scripts will be automatically loaded via PHP script 

If you open `package.json` in PHP Storm, you can execute npm script in its interface directly