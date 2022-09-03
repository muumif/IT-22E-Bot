import { Snowflake } from "discord.js";

export {};

declare global {
      namespace NodeJS {
            interface ProcessEnv {
                  PORT: number,
                  DISCORD_TOKEN: Snowflake,
                  USER_ID: Snowflake,
                  BITLY_ENDPOINT: string,
                  BITLY_TOKEN: string,
            }
      }
}

declare module "discord.js" {
      export interface Command {
            name: string,
            description: string,
            execute: (interaction: Interaction) => SomeType
      }
}