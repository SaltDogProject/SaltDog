# MessageChannel 一览

## INVOKE

-

## SUBSCRIBE

-   `reader.onTextSelect` returns data:string
-   `sidebar.onChange` returns {from,to} eachContains id,isBuildIn: true,viewName,viewSrc,name,show: true,uuid
-   `sidebar.sidebarMsg` returns { webviewId, viewName, event, data } = msg
-   `saltdog.panelStatusChange` returns {panel:str, visibility:bool }

## PUBLISH

-   `sidebar.pluginHostMsg:${viewName}` with channel,args
-   `statusbar.fieldChange` with fieldName,changedStr
-   `statusbar.createStatusBarItem` with {id,alignment,command,text,priority,tooltip,show}
