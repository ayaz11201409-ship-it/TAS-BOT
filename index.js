const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = "1509139975290097746";
const GUILD_ID = "1484978246238994482";
const YETKILI_ROL_ID = "1484979396627533988";
const LOG_KANAL_ID = "1493642736677552138";
const MUTE_ROL_ID = "1502330148198940724";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

const commands = [
    new SlashCommandBuilder().setName('ban').setDescription('Kullanıcıyı banlar').addUserOption(o => o.setName('hedef').setDescription('Hedef kullanıcı').setRequired(true)).addStringOption(o => o.setName('sebep').setDescription('Ban sebebi')),
    new SlashCommandBuilder().setName('kick').setDescription('Kullanıcıyı atar').addUserOption(o => o.setName('hedef').setDescription('Hedef kullanıcı').setRequired(true)).addStringOption(o => o.setName('sebep').setDescription('Kick sebebi')),
    new SlashCommandBuilder().setName('mute').setDescription('Kullanıcıyı susturur').addUserOption(o => o.setName('hedef').setDescription('Hedef kullanıcı').setRequired(true)).addStringOption(o => o.setName('sebep').setDescription('Mute sebebi')),
    new SlashCommandBuilder().setName('unmute').setDescription('Susturmayı kaldırır').addUserOption(o => o.setName('hedef').setDescription('Hedef kullanıcı').setRequired(true)),
    new SlashCommandBuilder().setName('terfi').setDescription('Kullanıcıya rol verir').addUserOption(o => o.setName('hedef').setDescription('Hedef kullanıcı').setRequired(true)).addRoleOption(o => o.setName('rol').setDescription('Verilecek rol').setRequired(true)),
    new SlashCommandBuilder().setName('tenzil').setDescription('Kullanıcıdan rol alır').addUserOption(o => o.setName('hedef').setDescription('Hedef kullanıcı').setRequired(true)).addRoleOption(o => o.setName('rol').setDescription('Alınacak rol').setRequired(true)),
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
    try {
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
        console.log('Bot aktif ve komutlar yüklendi!');
    } catch (e) { console.error('Komut yükleme hatası:', e); }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.member.roles.cache.has(YETKILI_ROL_ID)) return interaction.reply({ content: 'Bu komutu kullanmak için yetkiniz yok!', ephemeral: true });

    const { commandName, options, member, guild } = interaction;
    const target = options.getMember('hedef');
    const logChannel = guild.channels.cache.get(LOG_KANAL_ID);

    if (commandName === 'ban') {
        await target.ban({ reason: options.getString('sebep') || 'Sebep girilmedi' });
        interaction.reply(`🔨 ${target.user.tag} sunucudan banlandı.`);
        if (logChannel) logChannel.send(`🔨 **${target.user.tag}** banlandı. Yetkili: ${member.user.tag}`);
    } else if (commandName === 'kick') {
        await target.kick(options.getString('sebep') || 'Sebep girilmedi');
        interaction.reply(`👢 ${target.user.tag} sunucudan atıldı.`);
        if (logChannel) logChannel.send(`👢 **${target.user.tag}** atıldı. Yetkili: ${member.user.tag}`);
    } else if (commandName === 'mute') {
        await target.roles.add(MUTE_ROL_ID);
        interaction.reply(`🔇 ${target.user.tag} susturuldu.`);
        if (logChannel) logChannel.send(`🔇 **${target.user.tag}** susturuldu. Yetkili: ${member.user.tag}`);
    } else if (commandName === 'unmute') {
        await target.roles.remove(MUTE_ROL_ID);
        interaction.reply(`🔊 ${target.user.tag} susturması kaldırıldı.`);
        if (logChannel) logChannel.send(`🔊 **${target.user.tag}** susturması kaldırıldı. Yetkili: ${member.user.tag}`);
    } else if (commandName === 'terfi') {
        const role = options.getRole('rol');
        await target.roles.add(role);
        interaction.reply(`⬆️ ${target.user.tag} kullanıcısına ${role.name} rolü verildi.`);
        if (logChannel) logChannel.send(`⬆️ **${target.user.tag}** terfi aldı! Rol: ${role.name}`);
    } else if (commandName === 'tenzil') {
        const role = options.getRole('rol');
        await target.roles.remove(role);
        interaction.reply(`⬇️ ${target.user.tag} kullanıcısından ${role.name} rolü alındı.`);
        if (logChannel) logChannel.send(`⬇️ **${target.user.tag}** tenzil edildi! Rol: ${role.name}`);
    }
});

client.login(TOKEN);