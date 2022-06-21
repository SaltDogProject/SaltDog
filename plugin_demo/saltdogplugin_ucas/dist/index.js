"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const saltdog = __importStar(require("saltdog"));
function activate() {
    console.log('ucas plugin loaded');
    saltdog.library.registerInfoProvider({
        beforeRetrieve: (data) => {
            console.log('beforeRetrieve', data);
            return data;
        },
        afterRetrieve: (data) => {
            console.log('afterRetrieve', data);
            return data;
        },
    });
    saltdog.library.registerDisplayProvider((data) => {
        data.column.push({ displayName: '分区', indexName: 'region' });
        for (let i = 0; i < data.row.length; i++) {
            data.row[i].customFields = data.row[i].customFields || {};
            if (i % 2 == 0) {
                data.row[i].customFields['region'] = {
                    displayType: 'tag',
                    text: '北大核心',
                };
            }
            else {
                data.row[i].customFields['region'] = {
                    text: '暂无',
                };
            }
        }
        return data;
    });
}
exports.activate = activate;
function deactivate() {
    console.log('deactivate');
}
exports.deactivate = deactivate;
