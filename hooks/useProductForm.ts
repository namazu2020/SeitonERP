import { useState, useEffect, useRef, FormEvent } from "react";
import { upsertProduct } from "@/app/actions/products";
import { getVehicleDatabase, updateVehicleDatabase, getCategories, updateCategories } from "@/app/actions/config";
import { Product } from "@prisma/client";

// Constants
const INITIAL_VEHICLES: Record<string, string[]> = {
    "Toyota": ["Hilux", "Corolla", "Etios", "Yaris", "Corolla Cross", "SW4", "Prius", "Camry", "RAV4", "Hiace"],
    "Volkswagen": ["Gol Trend", "Amarok", "Vento", "Golf", "Polo", "Virtus", "T-Cross", "Nivus", "Taos", "Tiguan", "Saveiro", "Suran"],
    "Ford": ["Ranger", "EcoSport", "Fiesta", "Focus", "Ka", "Territory", "Maverick", "Bronco", "Mustang", "Kuga", "Transit"],
    "Chevrolet": ["Cruze", "Onix", "Tracker", "S10", "Spin", "Prisma", "Camaro", "Equinox", "Trailblazer", "Aveo", "Corsa"],
    "Fiat": ["Cronos", "Toro", "Strada", "Argo", "Mobi", "Pulse", "Fiorino", "Ducato", "Fastback", "Titano", "Palio", "Siena"],
    "Renault": ["Kangoo", "Sandero", "Stepway", "Logan", "Alaskan", "Duster", "Oroch", "Kwid", "Master", "Koleos", "Clio"],
    "Peugeot": ["208", "Partner", "2008", "3008", "408", "5008", "206", "207", "308", "Expert", "Boxer"],
    "Citroën": ["C4 Cactus", "Berlingo", "C3", "C5 Aircross", "Jumpy", "Jumper", "C4"],
    "Nissan": ["Frontier", "Kicks", "Versa", "Sentra", "X-Trail", "Leaf", "March", "Tiida"],
    "Jeep": ["Renegade", "Compass", "Commander", "Wrangler", "Gladiator", "Grand Cherokee"],
    "Honda": ["HR-V", "CR-V", "Civic", "Fit", "City", "Accord", "ZR-V"],
    "Mercedes-Benz": ["Sprinter", "Clase A", "Clase C", "Clase E", "GLA", "GLC", "GLE"],
    "BMW": ["Serie 1", "Serie 3", "Serie 5", "X1", "X3", "X5", "X6"],
    "Audi": ["A1", "A3", "A4", "Q2", "Q3", "Q5"],
    "Hyundai": ["Creta", "Tucson", "Santa Fe", "H1", "Staria", "i10", "i30"],
    "Kia": ["Sportage", "Seltos", "Carnival", "Cerato", "Rio", "Picanto"],
    "Chery": ["Tiggo 2", "Tiggo 4", "Tiggo 8", "QQ"],
    "Iveco": ["Daily"],
    "Ram": ["1500", "2500"],
};

const INITIAL_CATEGORIES = ["Frenos", "Filtros", "Suspensión", "Motor", "Iluminación", "Carrocería", "Transmisión", "Baterías", "Neumáticos", "Interior", "Accesorios", "Lubricantes"];

export interface CompatibilityItem {
    brand: string;
    model: string;
    year: string;
}

export function useProductForm(product: Product | null, onClose: () => void) {
    // --- State ---
    const [loading, setLoading] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    // Initial Data
    const [vehicleData, setVehicleData] = useState(INITIAL_VEHICLES);
    const [brands, setBrands] = useState(Object.keys(INITIAL_VEHICLES).sort());
    const [categories, setCategories] = useState<string[]>(INITIAL_CATEGORIES);

    // Category Logic
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    // Compatibility State
    const [currentCompat, setCurrentCompat] = useState<CompatibilityItem>({ brand: "", model: "", year: "" });
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [isAddingBrand, setIsAddingBrand] = useState(false);
    const [isAddingModel, setIsAddingModel] = useState(false);
    const [newBrandName, setNewBrandName] = useState("");
    const [newModelName, setNewModelName] = useState("");

    // Helper: Parse Compatibility
    const parseCompatibility = (jsonString: string | null | undefined): CompatibilityItem[] => {
        if (!jsonString) return [];
        try {
            const parsed = JSON.parse(jsonString);
            if (Array.isArray(parsed)) return parsed;
            if (typeof parsed === 'object') return [parsed]; // Legacy single object
            return [];
        } catch (e) {
            return [];
        }
    };

    // Form Data
    const [formData, setFormData] = useState({
        sku: product?.sku || "",
        name: product?.name || "",
        category: product?.category || "",
        priceList: product?.priceList || 0,
        stockActual: product?.stockActual || 0,
        stockMin: product?.stockMin || 0,
        location: product?.location || "",
        compatibility: parseCompatibility(product?.compatibility),
    });

    // --- Effects ---
    useEffect(() => {
        const loadData = async () => {
            // Load Vehicles
            const dbVehicles = await getVehicleDatabase();
            if (dbVehicles) {
                setVehicleData(dbVehicles);
                setBrands(Object.keys(dbVehicles).sort());
            }

            // Load Categories
            const dbCategories = await getCategories();
            if (dbCategories && dbCategories.length > 0) {
                setCategories(dbCategories.sort());
            } else {
                setCategories(INITIAL_CATEGORIES.sort()); // Default sorted
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        if (currentCompat.brand && vehicleData[currentCompat.brand]) {
            setAvailableModels(vehicleData[currentCompat.brand].sort());
        } else {
            setAvailableModels([]);
        }
    }, [currentCompat.brand, vehicleData]);

    // --- Actions ---

    const saveNewCategory = async () => {
        if (!newCategoryName.trim()) return;
        const cleanName = newCategoryName.trim();

        if (!categories.includes(cleanName)) {
            const newCategories = [...categories, cleanName].sort();
            setCategories(newCategories);
            setFormData({ ...formData, category: cleanName });
            await updateCategories(newCategories);
        } else {
            setFormData({ ...formData, category: cleanName });
        }

        setIsAddingCategory(false);
        setNewCategoryName("");
    };

    const saveNewBrand = () => {
        if (!newBrandName.trim()) return;
        const cleanName = newBrandName.trim();
        if (!vehicleData[cleanName]) {
            const newData = { ...vehicleData, [cleanName]: [] };
            setVehicleData(newData);
            setBrands(Object.keys(newData).sort());
            setCurrentCompat({ ...currentCompat, brand: cleanName, model: "" });
            updateVehicleDatabase(newData);
        }
        setIsAddingBrand(false);
        setNewBrandName("");
    };

    const saveNewModel = () => {
        if (!newModelName.trim() || !currentCompat.brand) return;
        const cleanModel = newModelName.trim();
        const currentBrand = currentCompat.brand;

        const brandModels = vehicleData[currentBrand] ? [...vehicleData[currentBrand]] : [];
        if (!brandModels.includes(cleanModel)) {
            brandModels.push(cleanModel);
            const newData = { ...vehicleData, [currentBrand]: brandModels };
            setVehicleData(newData);
            setAvailableModels(brandModels.sort());
            setCurrentCompat({ ...currentCompat, model: cleanModel });
            updateVehicleDatabase(newData);
        }
        setIsAddingModel(false);
        setNewModelName("");
    };

    const addCompatibility = () => {
        if (currentCompat.brand && currentCompat.model) {
            setFormData({
                ...formData,
                compatibility: [...formData.compatibility, currentCompat]
            });
            setCurrentCompat({ brand: "", model: "", year: "" });
        }
    };

    const removeCompatibility = (index: number) => {
        const newCompat = [...formData.compatibility];
        newCompat.splice(index, 1);
        setFormData({ ...formData, compatibility: newCompat });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await upsertProduct(product?.id, {
                ...formData,
                compatibility: JSON.stringify(formData.compatibility),
            });

            if (res.success) {
                onClose();
            } else {
                alert(res.error || "Error al guardar el producto");
            }
        } catch (error) {
            alert("Error inesperado");
        } finally {
            setLoading(false);
        }
    };

    const triggerSubmit = () => {
        if (formRef.current) {
            formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
    };

    return {
        // State
        formRef,
        loading,
        formData,
        setFormData,
        finalPrice: formData.priceList * 1.21,

        // Data
        brands,
        categories,
        availableModels,

        // UI State
        isAddingCategory, setIsAddingCategory,
        newCategoryName, setNewCategoryName,
        isAddingBrand, setIsAddingBrand,
        newBrandName, setNewBrandName,
        isAddingModel, setIsAddingModel,
        newModelName, setNewModelName,
        currentCompat, setCurrentCompat,

        // Actions
        saveNewCategory,
        saveNewBrand,
        saveNewModel,
        addCompatibility,
        removeCompatibility,
        handleSubmit,
        triggerSubmit
    };
}
