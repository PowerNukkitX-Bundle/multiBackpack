import { readFile, writeFile } from "./util.js";
import { Bag2String, String2Bag } from "./serialize.js";
import { Server } from "cn.nukkit.Server";
import { PowerNukkitX as pnx, EventPriority } from ":powernukkitx";

var worldconfig; // 全局配置，用于存储各个世界配置文件的内容

export function main() {
    let worldconfigtext = readFile("./plugins/mutiBackpack/groups.json")
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
    // 自动保存
    setInterval(saveAll, 10000);
    // 监听事件
    pnx.listenEvent("cn.nukkit.event.player.PlayerJoinEvent", EventPriority.NORMAL, event => {
        if (hasJoinedBefore(event.getPlayer())) {
            String2Bag(event.getPlayer(), getGroup(event.getPlayer().getLevel().getName()));
        } else {
            Bag2String(event.getPlayer(), getGroup(event.getPlayer().getLevel().getName()));
            worldconfig["played"].push(event.getPlayer().getName());
            writeFile("./plugins/mutiBackpack/groups.json", JSON.stringify(worldconfig, null, 4));
        }
    });
    pnx.listenEvent("cn.nukkit.event.player.PlayerQuitEvent", EventPriority.NORMAL, event => {
        Bag2String(event.getPlayer(), getGroup(event.getPlayer().getLevel().getName()));
    });
    pnx.listenEvent("cn.nukkit.event.player.PlayerTeleportEvent", EventPriority.NORMAL, event => {
        if (event.getFrom().getLevel().getName() !== event.getTo().getLevel().getName()) {
            Bag2String(event.getPlayer(), getGroup(event.getFrom().getLevel().getName()));
            String2Bag(event.getPlayer(), getGroup(event.getTo().getLevel().getName()));
        }
    });
    pnx.listenEvent("cn.nukkit.event.player.PlayerRespawnEvent", EventPriority.NORMAL, event => {
        String2Bag(event.getPlayer(), getGroup(event.getRespawnPosition().getLevel().getName()));
    });
    pnx.listenEvent("cn.nukkit.event.player.PlayerDeathEvent", EventPriority.NORMAL, event => {
        Bag2String(event.getEntity(),getGroup(event.getEntity().getLevel().getName()));
    })
}

function saveAll() {
    /** @type {cn.nukkit.Player[]} */
    let pls = Server.getInstance().getOnlinePlayers().values().toArray()
    for (const each of pls) {
        Bag2String(each, getGroup(each.getLevel().getName()));
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
    console.error("Goodbye world");
}
