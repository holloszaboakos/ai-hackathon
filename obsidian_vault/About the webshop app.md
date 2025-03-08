The webshop app is used as a demonstration of the capabilites of our solution. 

It is implemented in react using redux and redux toolkit. It is implemented in typescript for type safety and scalability. Is is also dockerized.

The application consists of two views, the main menu and the basket view. On the main menu shoes are displayed with their prices, descriptions and pictures. The user can add the products to the basket. On the basket view more of the selected products can be added or products can be removed. Also the user can either add or remove shipping. 

We integrated our ai persona with the website. Whenever a product or shipping is added or removed, the ai assistant displays a short emote video and comments on the action. There is also a chat available. The assistant can answer there more detailed questions about the product.

The emotions displayed are designed to build empathy and provide entertainment.

The App component implements the routing of the app and integrates the chatbot. The state is stored in the central cart reducer. The central state holds all information on the products, so changes are quite easy to follow in the reducer. On each reducer triggered events are generated and passed to the server for analyses. The server returns text, audio and selects one of the available short emotes. The text and emote are displayed in toast messages, while the sound is handled by the Audio player.

