import { GameApp } from "./app"

(async () => {
  // Create a new application
  const app = new GameApp()
  await app.run()
})();
