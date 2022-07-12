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
    player.getInventory().getContents().forEach((/** @type {Number} */ index, /** @type {cn.nukkit.item.Item} */ item) => {
        if (item === null) {
            item = AIR;
        }
        bjson[index] = {
            "id": item.getNamespaceId(),
            "count": item.getCount(),
            "data": item.getDamage(),
            "nbt": bytesToHexString(item.getCompoundTag())
        }
    })
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