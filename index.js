import { readFile, writeFile } from "./util.js";
import { Bag2String, String2Bag, EnderChest2String, String2EnderChest, Xp2String, String2Xp } from "./serialize.js";
import { Server } from "cn.nukkit.Server";
import { PowerNukkitX as pnx, EventPriority } from ":powernukkitx";
import { Item } from "cn.nukkit.item.Item";

const AIR = Item.get(0);
// 全局配置，用于存储各个世界配置文件的内容
var worldconfig;
//组别是否保存经验
var xpconfig = {}; //key:组名 value:是否保存经验

export function main() {
    let worldconfigtext = readFile("./plugins/mutiBackpack/groups.json");
    if (worldconfigtext === null) {
        worldconfigtext = JSON.stringify({
            "groups": [
                {
                    "name": "test",
                    "worlds": ["world"]
                }
            ],
            "played": []
        }, null, 4);
        writeFile("./plugins/mutiBackpack/groups.json", worldconfigtext);
    }
    worldconfig = JSON.parse(worldconfigtext);
    for (let i = 0; i < worldconfig['groups'].length; i++) {
        let each = worldconfig['groups'][i];
        if (each["xp"] === true) {
            xpconfig[each['name']] = true;
        } else {
            xpconfig[each['name']] = false;
        }
    }
    // 自动保存
    setInterval(saveAll, 240000);
    // 监听事件
    pnx.listenEvent("cn.nukkit.event.player.PlayerJoinEvent", EventPriority.HIGHEST, event => {
        if (hasJoinedBefore(event.getPlayer())) {
            String2Bag(event.getPlayer(), getGroup(event.getPlayer().getLevel().getName()));
            String2EnderChest(event.getPlayer(), getGroup(event.getPlayer().getLevel().getName()));
            String2Xp(event.getPlayer(), getGroup(event.getPlayer().getLevel().getName()), xpconfig);
        } else {
            Bag2String(event.getPlayer(), getGroup(event.getPlayer().getLevel().getName()));
            EnderChest2String(event.getPlayer(), getGroup(event.getPlayer().getLevel().getName()));
            Xp2String(event.getPlayer(), getGroup(event.getPlayer().getLevel().getName()), xpconfig);
            worldconfig["played"].push(event.getPlayer().getName());
            writeFile("./plugins/mutiBackpack/groups.json", JSON.stringify(worldconfig, null, 4));
        }
    });
    pnx.listenEvent("cn.nukkit.event.player.PlayerQuitEvent", EventPriority.HIGHEST, event => {
        Bag2String(event.getPlayer(), getGroup(event.getPlayer().getLevel().getName()));
        EnderChest2String(event.getPlayer(), getGroup(event.getPlayer().getLevel().getName()));
        Xp2String(event.getPlayer(), getGroup(event.getPlayer().getLevel().getName()), xpconfig);
    });
    pnx.listenEvent("cn.nukkit.event.player.PlayerTeleportEvent", EventPriority.HIGHEST, event => {
        if (!event.isCancelled() && event.getFrom().getLevel().getName() !== event.getTo().getLevel().getName()) {
            const player = event.getPlayer();
            player.removeAllWindows();
            const craft1 = player.getUIInventory().getCraftingGrid().getItem(0).getId();
            const craft2 = player.getUIInventory().getCraftingGrid().getItem(1).getId();
            const craft3 = player.getUIInventory().getCraftingGrid().getItem(2).getId();
            const craft4 = player.getUIInventory().getCraftingGrid().getItem(3).getId();
            const cursor = player.getCursorInventory().getItem(0).getId();
            if (craft1 !== 0 || craft2 !== 0 || craft3 !== 0 || craft4 !== 0 || cursor !== 0) {
                event.setCancelled();
                player.kick("Do not take items to another world!");
                return;
            }
            const off = player.getOffhandInventory().getItem(0);
            if (off.getId() !== 0) {
                player.getOffhandInventory().setItem(0, AIR);
                if (player.getInventory().canAddItem(off)) {
                    player.getInventory().addItem(off);
                } else {
                    player.getLevel().dropItem(player, off);
                }
            }
            Bag2String(event.getPlayer(), getGroup(event.getFrom().getLevel().getName()));
            event.getPlayer().getInventory().clearAll();
            EnderChest2String(event.getPlayer(), getGroup(event.getFrom().getLevel().getName()));
            Xp2String(event.getPlayer(), getGroup(event.getPlayer().getLevel().getName()), xpconfig);
            String2Bag(event.getPlayer(), getGroup(event.getTo().getLevel().getName()));
            String2EnderChest(event.getPlayer(), getGroup(event.getTo().getLevel().getName()));
            String2Xp(event.getPlayer(), getGroup(event.getTo().getLevel().getName()), xpconfig);
        }
    });
    pnx.listenEvent("cn.nukkit.event.player.PlayerRespawnEvent", EventPriority.HIGHEST, event => {
        String2Bag(event.getPlayer(), getGroup(event.getRespawnPosition().getLevel().getName()));
        String2EnderChest(event.getPlayer(), getGroup(event.getRespawnPosition().getLevel().getName()));
        String2Xp(event.getPlayer(), getGroup(event.getRespawnPosition().getLevel().getName()), xpconfig);
    });
    pnx.listenEvent("cn.nukkit.event.player.PlayerDeathEvent", EventPriority.HIGHEST, event => {
        Bag2String(event.getEntity(), getGroup(event.getEntity().getLevel().getName()));
        event.getEntity().getInventory().clearAll();
        EnderChest2String(event.getEntity(), getGroup(event.getEntity().getLevel().getName()));
        Xp2String(event.getEntity(), getGroup(event.getEntity().getLevel().getName()), xpconfig);
    })
}

function saveAll() {
    /** @type {cn.nukkit.Player[]} */
    let pls = Server.getInstance().getOnlinePlayers().values().toArray()
    for (const each of pls) {
        const groupName = getGroup(each.getLevel().getName());
        Bag2String(each, groupName);
        EnderChest2String(each, groupName);
        Xp2String(each, groupName, xpconfig);
    }
}

/**
 * 根据世界名称获取背包组名称
 * @param {string} worldname
 * @returns {string} 背包组名称
 */
function getGroup(worldname) {
    for (let i = 0; i < worldconfig['groups'].length; i++) {
        for (let j = 0; j < worldconfig['groups'][i]["worlds"].length; j++) {
            if (worldname === worldconfig['groups'][i]["worlds"][j]) {
                return worldconfig['groups'][i]["name"];
            }
        }
    }
    return "default";
}

/**
 * 获取玩家之前是否进过服
 * @param {cn.nukkit.Player} player
 * @returns {boolean}
 */
function hasJoinedBefore(player) {
    for (let i = 0; i < worldconfig["played"].length; i++) {
        if (worldconfig["played"][i] === player.getName()) {
            return true;
        }
    }
    return false;
}

export function close() {
    saveAll();
}
