export default class a {
    mounted(): void {
        this.disableDragEvent();
    }
    disableDragEvent(): void {
        window.addEventListener('dragenter', this.disableDrag, false);
        window.addEventListener('dragover', this.disableDrag);
        window.addEventListener('drop', this.disableDrag);
    }
    disableDrag(e: DragEvent): void {
        const dropzone = document.getElementById('upload-area');
        if (dropzone === null || !dropzone.contains(<Node>e.target)) {
            e.preventDefault();
            e.dataTransfer!.effectAllowed = 'none';
            e.dataTransfer!.dropEffect = 'none';
        }
    }
    beforeDestroy(): void {
        window.removeEventListener('dragenter', this.disableDrag, false);
        window.removeEventListener('dragover', this.disableDrag);
        window.removeEventListener('drop', this.disableDrag);
    }
}
