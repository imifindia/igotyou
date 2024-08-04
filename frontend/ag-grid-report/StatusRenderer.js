
class StatusRenderer  {
    eGui;
    init(params) {
        this.eGui = document.createElement('span');
        if (params.value) {
            const icon = params.value === 'Male' ? 'fa-male' : 'fa-female';
            this.eGui.innerHTML = `<i class="fa ${icon}"></i> ${params.value}`;
        }
    }

    getGui() {
        return this.eGui;
    }
    refresh(params) {
        return false;
    }
}