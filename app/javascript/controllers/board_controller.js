import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
    HEADERS = { 'ACCEPT': 'application/json' };

    getHeaders() {
        return Array.from(document.getElementsByClassName('kanban-board-header'));
    }

    getHeaderTitles() {
        return Array.from(document.getElementsByClassName('kanban-title-board'));
    }

    cursorifyHeaderTitles() {
        this.getHeaderTitles().forEach((headerTitle) => {
            headerTitle.classList.add('cursor-pointer');
        });
    }

    addLinkToHeaderTitles(boards) {
        this.getHeaderTitles().forEach((headerTitle, index) => {
            headerTitle.addEventListener('click', () => {
                Turbo.visit(`${this.element.dataset.boardListUrl}/${boards[index].id}/edit`);
            });
        }); 
    }

    buildBoardDeleteButton(boardId) {
        const button = document.createElement('button');
        button.classList.add('kanban-title-button', 'btn', 'btn-default', 'btn-xs', 'mr-2', 'cursor-pointer');
        button.textContent = 'x';
        button.addEventListener('click', (e) => {
            e.preventDefault();

            window.axios.delete(`${this.element.dataset.boardListUrl}/${boardId}`, {
                headers: this.HEADERS
            }).then(() => {
                Turbo.visit(window.location.href);
            });
        });
        return button;
    }

    addHeaderDeleteButton(boards) {
        this.getHeaders().forEach((header, index) => {
            header.appendChild(this.buildBoardDeleteButton(boards[index].id));
        });
    }

    connect() {
        window.axios.get(this.element.dataset.apiUrl, { headers: this.HEADERS }).then((response) => {
            this.buildKanban(this.buildBoards(response['data']));
            this.cursorifyHeaderTitles();
            this.addLinkToHeaderTitles(this.buildBoards(response['data']));
            this.addHeaderDeleteButton(this.buildBoards(response['data']));
        });
    }

    buildClassList() {
        return `text-white, bg-blue-800`;
    }

    buildItems(items) {
        return _.map(items, (item) => {
            return {
                'id': _.get(item, 'id'),
                'title': _.get(item, 'attributes.title'),
                'class': this.buildClassList(),
                'list-id': _.get(item, 'attributes.list_id'),
            }
        });
    }

    buildBoards(boardsData) {
        return _.map(boardsData['data'], (board) => {
            return {
                'id': _.get(board, 'id'),
                'title': _.get(board, 'attributes.title'),
                'class': this.buildClassList(),
                'item': this.buildItems(_.get(board, 'attributes.items.data'))
            }
        });
    }

    updateListPosition(el){
        window.axios.put(`${this.element.dataset.listPositionsApiUrl}/${el.dataset.id}`, {
            position: el.dataset.order - 1
        }, {
            headers: this.HEADERS
        }).then(() => {
        })
    }

    buildItemData(items) {
        return _.map(items, (item) => {
            return {
                id: item.dataset.eid,
                position: item.dataset.position,
                list_id: item.dataset.listId
            }
        });
    }

    itemPositioningApiCall(itemsData) {
        window.axios.put(this.element.dataset.itemPositionsApiUrl, {
            items: itemsData
        }, {
            headers: this.HEADERS
        }).then(() => {

        });
    }

    updateItemPositioning(target, source) {
        const targetItems = Array.from(target.getElementsByClassName('kanban-item'));
        const sourceItems = Array.from(source.getElementsByClassName('kanban-item'));

        targetItems.forEach((item, index) => {
            item.dataset.position = index;
            item.dataset.listId = target.closest('.kanban-board').dataset.id;
        });

        sourceItems.forEach((item, index) => {
            item.dataset.position = index;
            item.dataset.listId = source.closest('.kanban-board').dataset.id;
        });

        this.itemPositioningApiCall(this.buildItemData(targetItems));
        this.itemPositioningApiCall(this.buildItemData(sourceItems));
    }

    showItemModal() {
        document.getElementById('show-modal-div').click();
    }

    populateItemInformation(itemId) {
        window.axios.get(`/api/items/${itemId}`, { headers: this.HEADERS }).then((response) => {
            const data = response?.data?.data?.attributes ?? {};
            document.getElementById('item-title').textContent = data.title || "No title available";
            document.getElementById('item-description').textContent = data.description || "No description available";
            document.getElementById('item-edit-link').href = `/lists/${data.list_id}/items/${itemId}/edit`;
            document.getElementById('item-assign-member-link').href = `/items/${itemId}/item_members/new`;

            const memberList = _.map(_.get(data, 'members.data', []), (memberData) => {
                const listItem = document.createElement('li');
                listItem.textContent = memberData.attributes.email;
                return listItem;
            });

            document.getElementById('item-members-list').innerHTML = '';
            memberList.forEach((member) => {
                document.getElementById('item-members-list').appendChild(member);
            });

            document.getElementById('item-delete-link').href = `/lists/${data.list_id}/items/${itemId}`;
        });
    }

    buildKanban(boards) {
        new jKanban({
            element: `#${this.element.id}`,
            boards: boards,
            itemAddOptions: {
                enabled: true,
            },
            click: (el) => {
                this.showItemModal();
                this.populateItemInformation(el.dataset.eid);
            },
            buttonClick: (el, boardId) => {
                Turbo.visit(`/lists/${boardId}/items/new`)
            },
            dragendBoard: (el) => {
                this.updateListPosition(el);
            },
            dropEl: (el, target, source, sibling) => {
                this.updateItemPositioning(target, source);
            }
        });
    }
}