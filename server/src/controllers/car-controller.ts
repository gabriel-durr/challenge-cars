import {User} from "../models/user-cars-schema";

import {v4 as uuidV4} from "uuid";
import {Request, Response} from "express";

const createNewCar = async (req: Request, res: Response) => {
	const {
		body: car,
		params: {userId},
	} = req;

	const newCar = {
		carId: uuidV4(),
		...car,
	};

	const user = await User.findById(userId, "-password -id");

	const carExists = user.cars.some(car => car.model === newCar.model);

	if (carExists)
		return res.status(400).json({msg: "Esse modelo de carro já existe"});

	user.cars.push(newCar);
	await user.save();

	return res
		.status(201)
		.json({msg: `Carro ${newCar.model} criado com sucesso`});
};

const updateCar = async (req: Request, res: Response) => {
	const {
		body: carUpdate,
		params: {userId, carId},
	} = req;

	try {
		const user = await User.findById(userId, "-password");
		if (!user) return res.status(404).json({msg: "Usuário não encontrado."});

		const carIndex = user.cars.findIndex(car => car._id.toString() === carId);

		if (carIndex === -1)
			return res.status(404).json({msg: "Carro não encontrado."});

		Object.keys(carUpdate).forEach(key => {
			user.cars[carIndex][key] = carUpdate[key];
		});

		const updatedUser = await user.save();

		return res.status(200).json(updatedUser);
	} catch (error) {
		console.error(error);
		res.status(500).json({msg: "Erro no servidor."});
	}
};

const removeCar = async (req: Request, res: Response) => {
	const {userId, carId} = req.params;

	try {
		const user = await User.findById(userId, "-password");
		if (!user) return res.status(404).send("Usuário não encontrado.");

		const car = user.cars.id(carId);
		if (!car) return res.status(404).send("Carro não encontrado.");

		car.remove();
		await user.save();

		return res.json(user);
	} catch (error) {
		console.error(error);
		res.status(500).send("Erro no servidor.");
	}
};

export {createNewCar, updateCar, removeCar};