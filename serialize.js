import { readFile, writeFile, hexStringToBytes, bytesToHexString } from "./util.js";
import { Item } from "cn.nukkit.item.Item";

const AIR = Item.get(0);

/**
 * 将玩家的背包序列化为json后保存
 * @param {cn.nukkit.Player} player 玩家
 * @param {string} group 分组组名
 */
export function Bag2String(player, group) {
    let bjson = [];
    const inv = player.getInventory();
    for (let i = 0; i < 40; i++) {
        let item = inv.getItem(i);
        if (item === null) {
            item = AIR;
        }
        bjson[i] = {
            "id": item.getNamespaceId(),
            "count": item.getCount(),
            "data": item.getDamage(),
            "nbt": bytesToHexString(item.getCompoundTag())
        }
    }
    writeFile("./plugins/mutiBackpack/" + group + "/" + player.getName() + ".json", JSON.stringify(bjson));
}

/**
 * 将玩家的背包从json文件中读取
 * @param {cn.nukkit.Player} player 玩家
 * @param {string} group 分组组名
 */
export function String2Bag(player, group) {
    const inv = player.getInventory();
    let text = readFile("./plugins/mutiBackpack/" + group + "/" + player.getName() + ".json");
    if (text === null) {
        inv.clearAll();
        return;
    }
    const bjson = JSON.parse(text);
    for (let i = 0, len = bjson.length; i < len; i++) {
        const each = bjson[i];
        if (each === null) {
            inv.setItem(i, AIR);
        } else {
            const item = typeof each["id"] === "string" ? Item.fromString(each["id"]) : Item.get(each["id"]);
            if (each["nbt"]) {
                item.setCompoundTag(hexStringToBytes(each["nbt"]));
            }
            inv.setItem(i, item);
        }
    }
}

/**
 * @param {cn.nukkit.Player} player 玩家
 * @param {string} group 分组组名
 */
export function EnderChest2String(player, group) {
    let bjson = [];
    if (player == null) {
        return;
    }
    const inv = player.getEnderChestInventory();
    for (let i = 0; i < 27; i++) {
        let item = inv.getItem(i);
        if (item === null) {
            item = AIR;
        }
        bjson[i] = {
            "id": item.getNamespaceId(),
            "count": item.getCount(),
            "data": item.getDamage(),
            "nbt": bytesToHexString(item.getCompoundTag())
        }
    }
    writeFile("./plugins/mutiBackpack/" + group + "/" + player.getName() + "_enderchest" + ".json", JSON.stringify(bjson));
}

/**
 * @param {cn.nukkit.Player} player 玩家
 * @param {string} 分组组名
 */
export function String2EnderChest(player, group) {
    let text = readFile("./plugins/mutiBackpack/" + group + "/" + player.getName() + "_enderchest" + ".json");
    const inv = player.getEnderChestInventory();
    if (text === null) {
        inv.clearAll();
        return;
    }
    const bjson = JSON.parse(text);
    let items = [];
    for (let i = 0; i < bjson.length; i++) {
        const each = bjson[i];
        if (each === null) {
            inv.setItem(i, AIR);
        } else {
            const item = typeof each["id"] === "string" ? Item.fromString(each["id"]) : Item.get(each["id"]);
            if (each["nbt"]) {
                item.setCompoundTag(hexStringToBytes(each["nbt"]));
            }
            inv.setItem(i, item);
        }
    }
}

/**
 * @param {cn.nukkit.Player} player
 * @param {string} group
 */
export function Xp2String(player, group, xpconfig) {
    if (xpconfig[group]) {
        writeFile("./plugins/mutiBackpack/" + group + "/" + player.getName() + ".xp.json", player.getExperienceLevel() + "L" + player.getExperience());
    }
}

/**
 * @param {cn.nukkit.Player} player
 * @param {string} group
 */
export function String2Xp(player, group, xpconfig) {
    if (xpconfig[group] || group == "default") {
        let tmp = readFile("./plugins/mutiBackpack/" + group + "/" + player.getName() + ".xp.json").split("L");
        if (tmp === null) {
            player.setExperience(0, 0);
        } else {
            player.setExperience(Number(tmp[1]), Number(tmp[0]));
        }
    }
}