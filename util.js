import { Files } from "java.nio.file.Files";
import { Paths } from "java.nio.file.Paths";
import { StandardCharsets } from "java.nio.charset.StandardCharsets"
import { Integer } from "java.lang.Integer";

/**
 * @param {string} path 文件路径
 * @returns {string} 文件内容
 */
export function readFile(path) {
    const jPath = Paths.get(path);
    try {
        return Files.readString(jPath, StandardCharsets.UTF_8);
    } catch (e) {
        return null;
    }
}

/**
 * @param {string} path 文件路径
 * @param {string} content 文件内容
 * @returns {boolean} 是否写入成功
 */
export function writeFile(path, context) {
    const jPath = Paths.get(path);
    const jFolder = jPath.getParent();
    try {
        if (Files.notExists(jFolder)) {
            Files.createDirectories(jFolder);
        }
        if (Files.notExists(jPath)) {
            Files.createFile(jPath);
        }
        Files.writeString(jPath, context, StandardCharsets.UTF_8);
        return true;
    } catch (e) {
        e.printStackTrace();
        return false;
    }
}

/**
 * @param {byte[]} src
 * @returns {string} 字符串序列化的字节数组
 */
export function bytesToHexString(src) {
    let sb = "";
    if (src === null || src.length <= 0) {
        return null;
    }
    for (let i = 0, len = src.length; i < len; i++) {
        const v = src[i] & 0xff;
        const hv = Integer.toHexString(v);
        if (hv.length < 2) {
            sb += "0";
        }
        sb += hv;
    }
    return sb;
}

/**
 * @param {string} hexString
 * @returns {byte[]} 从字符串反序列的字节数组
 */
export function hexStringToBytes(hexString) {
    if (hexString === null || hexString === "") {
        return null;
    }
    hexString = hexString.toUpperCase();
    const length = hexString.length / 2;
    /** @type {number[]} */
    const d = [];
    for (let i = 0; i < length; i++) {
        const pos = i * 2;
        d[i] = toByte((charToByte(hexString.charAt(pos)) << 4) | charToByte(hexString.charAt(pos + 1)));
    }
    return Java.to(d, "byte[]");
}

function charToByte(c) {
    return "0123456789ABCDEF".indexOf(c);
}

function toByte(x) {
    return ((((x | 0) & 0xff) + 128) % 256) - 128;
}