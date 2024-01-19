class User {
    constructor(id, username, email, role, createdAt, updatedAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Endpoint base
    static baseUrl = "http://24.144.87.218/api/users";

    // Método estático para crear un nuevo usuario
    static async create(username, password, email, role) {
        const response = await fetch(`${this.baseUrl}/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, email, role }),
        });
        const data = await response.json();
        if (response.ok) {
            return new User(
                data.id,
                username,
                email,
                role,
                data.created_at,
                data.updated_at
            );
        } else {
            throw new Error(data.message || "Error al crear el usuario");
        }
    }

    // Método estático para obtener un usuario por ID
    static async getById(userId) {
        console.log("getById");
        const response = await fetch(`${this.baseUrl}/${userId}`);

        console.log(response);

        const data = await response.json();

        console.log(data);

        if (response.ok) {
            return new User(
                data[0].id,
                data[0].username,
                data[0].email,
                data[0].role,
                data[0].created_at,
                data[0].updated_at
            );
        } else {
            console.log("no");
            // throw new Error(data.message || 'Usuario no encontrado');
            return null;
        }
    }

    // Método de instancia para actualizar un usuario
    async update(username, email, role) {
        const response = await fetch(`${User.baseUrl}/update/${this.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, role }),
        });
        const data = await response.json();
        if (response.ok) {
            this.username = username;
            this.email = email;
            this.role = role;
            this.updatedAt = data.updatedAt;
        } else {
            throw new Error(data.message || "Error al actualizar el usuario");
        }
    }

    // Método de instancia para eliminar un usuario
    async delete() {
        const response = await fetch(`${User.baseUrl}/delete/${this.id}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || "Error al eliminar el usuario");
        }
    }

    // Método estático para obtener lista de usuarios con paginación, ordenación y búsqueda
    static async getList(
        order_by_field = "id",
        order_by_direction = "ASC",
        search = "",
        page = 1,
        page_size = 10
    ) {
        const queryParams = new URLSearchParams({
        order_by_field,
        order_by_direction,
        search,
        page,
        page_size,
        });
        const response = await fetch(`${this.baseUrl}/list?${queryParams}`);
        return response.json();
    }
}

export default User;
