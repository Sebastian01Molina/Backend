import db from '../dist/db/models/index.js';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';

const createUser = async (req) => {
    const {
        name,
        email,
        password,
        password_second,
        cellphone
    } = req.body;
    if (password !== password_second) {
        return {
            code: 400,
            message: 'Contraseña incorrecta'
        };
    }
    const user = await db.User.findOne({
        where: {
            email: email
        }
    });
    if (user) {
        return {
            code: 400,
            message: 'Usuario ya existe'
        };
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.User.create({
        name,
        email,
        password: encryptedPassword,
        cellphone,
        status: true
    });
    return {
        code: 200,
        message: 'Usuario creado con ID: ' + newUser.id,
    }
};

const bulkCreateUsers = async (users) => {
    let successfulCount = 0;
    let failedCount = 0;

    for (const user of users) {
        const { name, email, password, password_second, cellphone } = user;

        if (password !== password_second) {
            failedCount++;
            continue;
        }

        const existingUser = await db.User.findOne({ where: { email } });
        if (existingUser) {
            failedCount++;
            continue;
        }

        try {
            const encryptedPassword = await bcrypt.hash(password, 10);
            await db.User.create({
                name,
                email,
                password: encryptedPassword,
                cellphone,
                status: true
            });
            successfulCount++;
        } catch (error) {
            failedCount++;
        }
    }

    return {
        code: 200,
        message: 'Proceso de creación masiva completado',
        data: {
            successfulCount,
            failedCount
        }
    };
};

const getUserById = async (id) => {
    return {
        code: 200,
        message: await db.User.findOne({
            where: {
                id: id,
                status: true,
            }
        })
    };
}

const updateUser = async (req) => {
    const user = db.User.findOne({
        where: {
            id: req.params.id,
            status: true,
        }
    });
    const payload = {};
    payload.name = req.body.name ?? user.name;
    payload.password = req.body.password ? await bcrypt.hash(req.body.password, 10) : user.password;
    payload.cellphone = req.body.cellphone ?? user.cellphone;
    await db.User.update(payload, {
        where: {
            id: req.params.id
        }

    });
    return {
        code: 200,
        message: 'Usuario actualizado correctamente'
    };
}

const deleteUser = async (id) => {
    /* await db.User.destroy({
        where: {
            id: id
        }
    }); */
    const user = db.User.findOne({
        where: {
            id: id,
            status: true,
        }
    });
    await  db.User.update({
        status: false
    }, {
        where: {
            id: id
        }
    });
    return {
        code: 200,
        message: 'Usuario eliminado exitosamente'
    };
}

const getAllUsers = async () => {
    try {
        const users = await db.User.findAll({
        });
        return {
            code: 200,
            message: 'Usuario recibido',
            data: users
        };
    } catch (error) {
        return {
            code: 500,
            message: 'A ocurrido un error al encontrar el usuario',
            error: error.message
        };
    }
};

const findUsers = async (query) => {
    const { status, name, Before, After } = query;
    const whereConditions = {};

    if (status !== undefined) {
        whereConditions.status = status === 'true';
    }

    if (name) {
        whereConditions.name = {
            [Op.like]: `%${name}%`
        };
    }

    if (Before && After) {
        whereConditions.createdAt = {
            [Op.between]: [new Date(After), new Date(Before)],
        };
    } else if (Before) {
        whereConditions.createdAt = {
            [Op.lte]: new Date(Before)
        };
    } else if (After) {
        whereConditions.createdAt = {
            [Op.gte]: new Date(After)
        };
    }

    try {
        const users = await db.User.findAll({
            where: whereConditions
        });

        return {
            code: 200,
            message: 'Usuarios encontrados',
            data: users,
        };
    } catch (error) {
        console.error('Error querying users:', error);
        return {
            code: 500,
            message: 'Error interno del servidor',
            error: error.message,
        };
    }
};
export default {
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    getAllUsers,
    findUsers,
    bulkCreateUsers
}