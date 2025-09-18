import React, { useEffect, useState } from "react";
import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, FormControlLabel,
    Checkbox, Select, MenuItem, InputLabel, FormControl, IconButton, Tabs, Tab,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import axios from "../Axiosinstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmDialog from "../Constants/ConfirmDialog";
import { useTheme, useMediaQuery } from '@mui/material';
import InfiniteScrollWrapper from "../Constants/InfiniteScrollWrapper";
import NoDataPage from "../Nodatapage";

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]); // Added filtered products state
    const [open, setOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [filterText, setFilterText] = useState('');
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [formData, setFormData] = useState({
        productCode: "",
        productName: "",
        description: "",
        type: "",
        price: "",
        stock: "",
        category: "",
        active: true,
    });

    // Fetch products
    const fetchProducts = async () => {
        try {
            const res = await axios.get("/products/get-all");
            setProducts(res.data);
            setFilteredProducts(res.data); // Initialize filtered products with all products
        } catch (error) {
            toast.error("Error fetching products");
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Filter products based on search text
    useEffect(() => {
        if (filterText.trim() === '') {
            setFilteredProducts(products);
        } else {
            const filtered = products.filter(product =>
                (product.code || product.productCode || '').toLowerCase().includes(filterText.toLowerCase()) ||
                (product.name || product.productName || '').toLowerCase().includes(filterText.toLowerCase()) ||
                (product.description || '').toLowerCase().includes(filterText.toLowerCase()) ||
                (product.category || '').toLowerCase().includes(filterText.toLowerCase())
            );
            setFilteredProducts(filtered);
        }
    }, [filterText, products]);

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // Handle form input change
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            productCode: "",
            productName: "",
            description: "",
            type: "SALE_ITEM",
            price: "",
            stock: "",
            category: "",
            active: true,
        });
        setIsEdit(false);
        setEditId(null);
    };

    // Add or Update product
    const handleSubmit = async () => {
        try {
            if (isEdit) {
                await axios.put(`/products/${editId}`, formData);
                toast.success("Product updated successfully!");
            } else {
                await axios.post("/products", formData);
                toast.success("Product added successfully!");
            }
            setOpen(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            toast.error("Error saving product");
        }
    };

    // Edit product
    const handleEdit = (prod) => {
        setFormData({
            productCode: prod.code || prod.productCode || "",
            productName: prod.name || prod.productName || "",
            description: prod.description || "",
            type: prod.type || "SALE_ITEM",
            price: prod.price || "",
            stock: prod.stock || "",
            category: prod.category || "",
            active: prod.active || true,
        });
        setIsEdit(true);
        setEditId(prod.id);
        setOpen(true);
    };

    // Open confirm dialog
    const handleDelete = (id) => {
        setDeleteId(id);
        setConfirmDialogOpen(true);
    };

    // Confirm delete
    const confirmDelete = async () => {
        try {
            await axios.delete(`/products/${deleteId}`);
            toast.success("Product deleted successfully!");
            fetchProducts();
        } catch (error) {
            toast.error("Error deleting product");
        } finally {
            setConfirmDialogOpen(false);
            setDeleteId(null);
        }
    };

    // Helper function to display data or '-'
    const displayData = (value) => {
        return value || value === 0 ? value : '-';
    };

    return (
        <>
            <Tabs
                value={activeTab}
                onChange={handleTabChange}
                variant="fullWidth"
                TabIndicatorProps={{ style: { backgroundColor: 'transparent' } }}
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    bgcolor: '#F0F4F8',
                    padding: '8px 12px',
                    '& .MuiTab-root': {
                        textTransform: 'none',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        color: '#142a4f',
                        padding: '6px 18px',
                        backgroundColor: '#ffffff',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                            backgroundColor: '#e6ecf3',
                        },
                        '&.Mui-selected': {
                            backgroundColor: '#142a4f',
                            color: '#ffffff',
                            boxShadow: '0px 2px 6px rgba(0,0,0,0.1)',
                        },
                    },
                }}
            >
                <Tab label="PRODUCT LIST" />
            </Tabs>
            <Paper sx={{ p: 2 }}>
                <Box>
                    <ToastContainer position="bottom-right" autoClose={2000} />

                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: isMobile ? "column" : "row",
                            alignItems: "center",
                            gap: 2, // space between button and textfield
                            mb: 2,
                        }}
                    >
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                resetForm();
                                setOpen(true);
                            }}
                            fullWidth={isMobile} // Full width on small screens
                            sx={{
                                minWidth: isMobile ? "100%" : "auto",
                            }}
                        >
                            Add Product
                        </Button>

                        <TextField
                            placeholder="Search Products"
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            variant="outlined"
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <span style={{ marginRight: 4, color: "#888" }}></span>
                                ),
                            }}
                            sx={{
                                width: isMobile ? "100%" : "300px",
                            }}
                        />
                    </Box>

                    {/* Table */}
                    <TableContainer component={Paper}>
                        <Box sx={{ width: '100%', overflowX: 'auto' }}>
                            <InfiniteScrollWrapper
                                dataLength={setFilteredProducts.length}
                                next={() => fetchProducts()}
                                hasMore={hasMore}
                                loading={loadingMore}
                            >
                                <Table stickyHeader size="small" sx={{
                                    minWidth: 650,
                                    '& .MuiTableCell-root': {
                                        border: '1px solid rgba(224, 224, 224, 1)',
                                        padding: '8px 12px',
                                        fontSize: '0.875rem',
                                        textAlign: 'center',
                                        fontFamily: 'Marquis',
                                        textTransform: 'uppercase',
                                    },
                                    '& .MuiTableCell-head': {
                                        backgroundColor: '#f5f5f5',
                                        fontWeight: 'bold',
                                        position: 'sticky',
                                        top: 0,
                                        zIndex: 1,
                                    },
                                    '& .MuiTableRow-root:nth-of-type(odd)': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.02)'
                                    },
                                    '& .MuiTableRow-root:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                    }
                                }}>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell align="center">S.NO</TableCell>
                                            <TableCell sx={{ width: '100px' }}>Code</TableCell>
                                            <TableCell sx={{ width: '150px' }}>Product Name</TableCell>
                                            <TableCell sx={{
                                                width: '200px',
                                                maxWidth: '200px',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>Description</TableCell>
                                            <TableCell sx={{ width: '100px' }}>Type</TableCell>
                                            <TableCell sx={{ width: '80px' }}>Price</TableCell>
                                            <TableCell sx={{ width: '80px' }}>Stock</TableCell>
                                            <TableCell sx={{ width: '120px' }}>Category</TableCell>
                                            <TableCell sx={{ width: '80px' }}>Active</TableCell>
                                            <TableCell sx={{ width: '100px' }}>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredProducts.length > 0 ? (
                                            filteredProducts.map((prod, index) => (
                                                <TableRow key={prod.id}>
                                                    <TableCell sx={{ width: '100px' }}>{index + 1}</TableCell>
                                                    <TableCell sx={{ width: '100px' }}>{displayData(prod.code || prod.productCode)}</TableCell>
                                                    <TableCell sx={{ width: '150px' }}>{displayData(prod.name || prod.productName)}</TableCell>
                                                    <TableCell sx={{
                                                        width: '200px',
                                                        maxWidth: '200px',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        textAlign: 'left',
                                                        textTransform: 'none'
                                                    }}>
                                                        {displayData(prod.description)}
                                                    </TableCell>
                                                    <TableCell sx={{ width: '100px' }}>{displayData(prod.type)}</TableCell>
                                                    <TableCell sx={{ width: '80px' }}>{displayData(prod.price)}</TableCell>
                                                    <TableCell sx={{ width: '80px' }}>{displayData(prod.stock)}</TableCell>
                                                    <TableCell sx={{ width: '120px' }}>{displayData(prod.category)}</TableCell>
                                                    <TableCell sx={{ width: '80px' }}>{prod.active ? "Yes" : "No"}</TableCell>
                                                    <TableCell sx={{ width: '100px' }}>
                                                        <IconButton
                                                            color="primary"
                                                            onClick={() => handleEdit(prod)}
                                                            size="small"
                                                        >
                                                            <Edit />
                                                        </IconButton>
                                                        <IconButton
                                                            color="error"
                                                            onClick={() => handleDelete(prod.id)}
                                                            size="small"
                                                        >
                                                            <Delete />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={10} align="center">
                                                  <NoDataPage />
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </InfiniteScrollWrapper>
                        </Box>
                    </TableContainer>

                    {/* Modal */}
                    <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
                        <DialogTitle sx={{ backgroundColor: '#142a4f', color: 'white' }}
                         textAlign="center">
                            {isEdit ? "EDIT PRODUCT" : "ADD PRODUCT"}
                        </DialogTitle>

                        <DialogContent dividers>
                            <TextField
                                margin="dense"
                                label="Product Code"
                                name="productCode"
                                fullWidth
                                value={formData.productCode}
                                onChange={handleChange}
                            />
                            <TextField
                                margin="dense"
                                label="Product Name"
                                name="productName"
                                fullWidth
                                value={formData.productName}
                                onChange={handleChange}
                            />
                            <TextField
                                margin="dense"
                                label="Description"
                                name="description"
                                fullWidth
                                value={formData.description}
                                onChange={handleChange}
                            />

                            {/* Dropdown for type */}
                            <FormControl margin="dense" fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    name="type"
                                    label="Type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    fullWidth
                                >
                                    <MenuItem value="SALE_ITEM">SALE_ITEM</MenuItem>
                                    <MenuItem value="SERVICE">SERVICE</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                margin="dense"
                                label="Price"
                                name="price"
                                type="number"
                                fullWidth
                                value={formData.price}
                                onChange={handleChange}
                            />
                            <TextField
                                margin="dense"
                                label="Stock"
                                name="stock"
                                type="number"
                                fullWidth
                                value={formData.stock}
                                onChange={handleChange}
                            />
                            <TextField
                                margin="dense"
                                label="Category"
                                name="category"
                                fullWidth
                                value={formData.category}
                                onChange={handleChange}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.active}
                                        onChange={handleChange}
                                        name="active"
                                    />
                                }
                                label="Active"
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={() => {
                                    setOpen(false);
                                    resetForm();
                                }}
                                color="secondary"
                                variant="outlined"
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} color="primary" variant="contained">
                                {isEdit ? "Update" : "Save"}
                            </Button>
                        </DialogActions>
                    </Dialog>

                    {/* Confirm Delete Dialog */}
                    <ConfirmDialog
                        open={confirmDialogOpen}
                        onClose={() => setConfirmDialogOpen(false)}
                        onConfirm={confirmDelete}
                        title="Confirm Deletion"
                        message="Are you sure you want to delete this product?"
                        confirmText="Delete"
                    />
                </Box>
            </Paper>
        </>
    );
};

export default ProductList;