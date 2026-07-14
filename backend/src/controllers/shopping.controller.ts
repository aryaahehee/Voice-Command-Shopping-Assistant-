import { Response, NextFunction } from "express";
import * as ShoppingService from "../services/shopping.service";
import { AuthRequest } from "../middleware/auth.middleware";
import { ItemCategory, ItemUnit } from "../models/ShoppingItem.model";

export async function listItems(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      category,
      checked,
      search,
      page,
      limit,
      sortBy,
      sortOrder,
    } = req.query as Record<string, string | undefined>;

    const { items, total } = await ShoppingService.getItems(req.userId!, {
      category: category as ItemCategory | undefined,
      checked:
        checked === "true" ? true : checked === "false" ? false : undefined,
      search,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      sortBy: sortBy as "createdAt" | "name" | "category" | undefined,
      sortOrder: sortOrder as "asc" | "desc" | undefined,
    });

    res.status(200).json({
      success: true,
      data: items,
      total,
      page: page ? parseInt(page, 10) : 1,
    });
  } catch (err) {
    next(err);
  }
}

export async function getItem(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const item = await ShoppingService.getItemById(req.userId!, req.params.id);
    res.status(200).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

export async function createItem(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { name, quantity, unit, category, notes, estimatedPrice, brand } =
      req.body as {
        name: string;
        quantity?: number;
        unit?: ItemUnit;
        category?: ItemCategory;
        notes?: string;
        estimatedPrice?: number;
        brand?: string;
      };

    const item = await ShoppingService.createItem(req.userId!, {
      name,
      quantity,
      unit,
      category,
      notes,
      estimatedPrice,
      brand,
    });

    res.status(201).json({
      success: true,
      message: `"${item.name}" added to your shopping list.`,
      data: item,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateItem(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const item = await ShoppingService.updateItem(
      req.userId!,
      req.params.id,
      req.body as Parameters<typeof ShoppingService.updateItem>[2]
    );

    res.status(200).json({
      success: true,
      message: "Item updated.",
      data: item,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteItem(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await ShoppingService.deleteItem(req.userId!, req.params.id);
    res.status(200).json({ success: true, message: "Item removed." });
  } catch (err) {
    next(err);
  }
}

export async function clearChecked(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const count = await ShoppingService.deleteCheckedItems(req.userId!);
    res.status(200).json({
      success: true,
      message: `Cleared ${count} completed item${count !== 1 ? "s" : ""}.`,
      data: { deletedCount: count },
    });
  } catch (err) {
    next(err);
  }
}
