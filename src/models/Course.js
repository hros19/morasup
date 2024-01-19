class Course {
    constructor(id, name, code, active, createdAt, updatedAt) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Endpoint base
    static baseUrl = "http://24.144.87.218/api/courses";

    // Agregar 
    static async add(name, code, active) {
        const body = JSON.stringify({ name, code, active });

        const response = await fetch(`${this.baseUrl}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body,
        });

        if (!response.ok) {
            console.log(response);
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    }

    // Listar cursos
    static async list(
        order_by_field = "name",
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
        const response = await fetch(`${this.baseUrl}?${queryParams}`);
        return response.json();
    }

    // Obtener un curso por ID
    static async getById(courseId) {
        const response = await fetch(`${this.baseUrl}/${courseId}`);
        if (!response.ok) {
        throw new Error("Curso no encontrado");
        }
        return response.json();
    }

  // Eliminar un curso
    static async delete(courseId) {
        const response = await fetch(`${this.baseUrl}/${courseId}`, {
            method: "DELETE",
        });
        return response.json();
    }
}

export default Course;
