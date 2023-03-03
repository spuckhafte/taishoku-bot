import { CommandInteraction, MessageEmbed } from "discord.js";
import Users from "../schema/User";
import client from "../server";
import { CmdoArgs } from "../types";
import assignCurrency from "../helpers/assignCurrency";

import { fame, elixir } from '../data/money.json';
import { puffyId, puffyTaxLog, sendMoneyCd } from '../data/settings.json';
import { money } from '../data/emojis.json';
import updateDb from "../helpers/updateDb";
import { timeRange } from "../helpers/toolbox";


export default async (args:CmdoArgs) => {
    const interaction = args.Interaction;
    const subCmd = interaction.options.getSubcommand();
    const target = interaction.options.getUser('friend', true);
    const amount = interaction.options.getNumber('amount', true);
    let purpose = interaction.options.getString('purpose');

    const validPurpose:string[] = ["ramen", "events", "missions", "nitro", "roles", "invites"];

    if (!client.user || !client.user.avatar) return;
    if (subCmd !== 'fame' && subCmd !== 'elixir') return;
    if (!validPurpose.includes(purpose ? purpose : '')) purpose = 'noroot';

    if (interaction.user.id == target.id) {
        await interaction.reply({
            content: "You can't send money to yourself",
            ephemeral: true
        });
        return;
    }

    const user = await Users.findOne({ id: interaction.user.id });
    const friend = await Users.findOne({ id: target.id });
    
    if (!friend || !user) {
        await interaction.reply({
            content: "One of you is not registered, use `/register`",
            ephemeral: true
        });
        return;
    }

    if (friend.inventory?.services?.[10]?.bought == true) {
        await interaction.reply({
            content: "You can't transfer money to a Tier 5",
            ephemeral: true
        });
        return;
    }

    if (typeof user?.totalElixir != 'number' || typeof user?.totalFame != 'number') return;

    const deltaTime = Date.now() - +user.sendCooldown;
    if (deltaTime < sendMoneyCd * 1000) {
        const still = (+(sendMoneyCd/60).toFixed(0) - timeRange(user.sendCooldown, Date.now()).minutes).toFixed(2);
        await interaction.reply({
            content: `Wait for \`${still} minutes\``,
            ephemeral: true
        });
        return;
    }

    if (amount <= 0) {
        await interaction.reply({
            content: `Invalid Amount`,
            ephemeral: true
        });
        return;
    }

    const puffy = interaction.guild?.members.cache.find(mem => mem.id == puffyId);
    if (!puffy) return;

    if (purpose != "ramen" && purpose != 'events' && purpose != "missions" && 
            purpose != "nitro" && purpose != "roles" && purpose !== 'noroot' && purpose != 'invites'
    ) return;

    if (subCmd == 'fame') {
        const { finalAmt, tax } = afterTax(amount, fame.tax.transfer, fame.tax.noTaxTransferLim);

        if (finalAmt > user?.totalFame) {
            await interaction.reply({
                content: "You do not have enough fame",
                ephemeral: true
            });
            return;
        }

        if (tax < fame.tax.noCooldownTaxFameAmt) 
            await updateDb({ id: user.id }, 'sendCooldown', Date.now());

        await assignCurrency.fame(friend?.id, purpose, finalAmt);
        await assignCurrency.spend.fame(user.id, finalAmt);
        if (tax > 0) await assignCurrency.fame(puffy.id, 'noroot', tax);

        const receipt = sendReceipt(subCmd, interaction, target.id, amount, tax, finalAmt);
        if (!receipt) return;

        const puffLog = interaction.guild?.channels.cache.find(ch => ch.id == puffyTaxLog);
        if (puffLog?.isText() && tax > 0) await puffLog.send(`**+${tax} ${subCmd}**`);
        await interaction.reply({ embeds: [receipt] });
    }

    if (subCmd == 'elixir') {
        const { finalAmt, tax } = afterTax(amount, elixir.tax.transfer, elixir.tax.noTaxTransferLim);

        if (finalAmt > user?.totalElixir) {
            await interaction.reply({
                content: "You do not have enough elixir",
                ephemeral: true
            });
            return;
        }

        if (tax < elixir.tax.noCooldownTaxElixirAmt) 
            await updateDb({ id: user.id }, 'sendCooldown', Date.now());

        await assignCurrency.elixir(friend?.id, purpose, finalAmt);
        await assignCurrency.spend.elixir(user.id, finalAmt);
        if (tax > 0) await assignCurrency.elixir(puffy.id, 'noroot', tax);

        const receipt = sendReceipt(subCmd, interaction, target.id, amount, tax, finalAmt);
        if (!receipt) return;

        const puffLog = interaction.guild?.channels.cache.find(ch => ch.id == puffyTaxLog);
        if (puffLog?.isText() && tax > 0) await puffLog.send(`**+${tax} ${subCmd}**`);
        await interaction.reply({ embeds: [receipt] });
    }
    
}


function afterTax(amt:number, tax:number, noTaxLimit:number) {
    if (amt <= noTaxLimit) return {
        finalAmt: amt,
        tax: 0
    }
    const taxIncrement = (tax/100) * (amt - noTaxLimit);
    return {
        finalAmt: amt + +taxIncrement.toFixed(2),
        tax: +taxIncrement.toFixed(2)
    }
}

function sendReceipt(subCmd:string, interaction:CommandInteraction, target:string, amount:number, tax:number, finalAmt:number) {
    if (!client.user) return;
    return new MessageEmbed({
        title: `${money} ${subCmd.toUpperCase()} ${subCmd.toUpperCase()} TRANSFER RECEIPT`,
        description: `**From: **<@${interaction.user.id}>\n**To:** <@${target}>\n**Amount: \`${amount} ${subCmd}\`**\n**Tax: \`${tax} ${subCmd}\`**\n**Final Amount: \`${finalAmt} ${subCmd}\`**`,
        thumbnail: {
            url: client.user.displayAvatarURL()
        },
        footer: {
            text: `${interaction.createdAt.toString().replace(/\([A-Z a-z]+\)/g, '')}`,
            iconURL: interaction.user.displayAvatarURL()
        }
    });
}