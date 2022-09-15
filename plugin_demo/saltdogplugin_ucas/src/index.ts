import * as saltdog from 'saltdog';
export function activate() {
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
        console.log('dp', data);
        data.column.push({ displayName: '分区', indexName: 'region' });
        for (let i = 0; i < data.row.length; i++) {
            data.row[i].customFields = data.row[i].customFields || {};
            if (i % 2 == 0) {
                data.row[i].customFields!['region'] = {
                    displayType: 'tag',
                    text: '北大核心',
                };
            } else {
                data.row[i].customFields!['region'] = {
                    text: '暂无',
                };
            }
        }
        return data;
    });
}
export function deactivate() {
    console.log('deactivate');
}
