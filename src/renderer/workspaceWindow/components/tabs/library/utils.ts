const libImgPath = `${'file:///'+__static}/images/workspace/library`;
export function getMIMEImage(type: string) {
    if (!type) return;
    type = type.toLowerCase().trim();
    switch (type) {
        case 'text/html':
            return libImgPath + '/text_html.svg';
        case 'application/pdf':
            return libImgPath + '/application_pdf.svg';
        default:
            return libImgPath + '/defaultMIME.svg';
    }
}

export function getItemTypeImage(type: string) {
    if (!type) return;
    type = type.trim();
    switch (type) {
        case 'blogPost':
            return libImgPath + '/blog.svg';
        case 'book':
            return libImgPath + '/book.svg';
        case 'bookSection':
            return libImgPath + '/section.svg';
        case 'conferencePaper':
            return libImgPath + '/conference.svg';
        case 'dictionaryEntry':
            return libImgPath + '/dictionary.svg';
        case 'document':
            return libImgPath + '/defaultMIME.svg';
        case 'encyclopediaArticle':
            return libImgPath + '/encyclopedia.svg';
        case 'forumPost':
            return libImgPath + '/fourum.svg';
        case 'journalArticle':
            return libImgPath + '/journal.svg';
        case 'magazineArticle':
            return libImgPath + '/magazine.svg';
        case 'newspaperArticle':
            return libImgPath + '/newspaper.svg';
        case 'note':
            return libImgPath + '/note.svg';
        case 'patent':
            return libImgPath + '/patent.svg';
        case 'preprint':
            return libImgPath + '/journal.svg';
        case 'presentation':
            return libImgPath + '/presentation.svg';
        case 'report':
            return libImgPath + '/presentation.svg';
        case 'statute':
            return libImgPath + '/statute.svg';
        case 'thesis':
            return libImgPath + '/thesis.svg';
        case 'webpage':
            return libImgPath + '/text_html.svg';
        default:
            return libImgPath + '/defaultMIME.svg';
    }
}
