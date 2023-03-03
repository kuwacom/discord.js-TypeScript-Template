import Discord from "discord.js";

export interface command {
    command: {
        name: string,
        description: string,
        options: [
            {
                type: number,
                name: string,
                description: string,
                required: boolean
            }
        ]
    },
    executeMessage(message: Discord.Message): void
    executeInteraction(interaction: Discord.CommandInteraction): void
}
