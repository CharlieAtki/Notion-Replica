import { useState, useEffect, useRef } from "react";

const WorkspaceTable = () => {
    // UseStates to manage the currently displayed info
    const [columns, setColumns] = useState([]);
    const [rows, setRows] = useState([]);
    const [activeColumnMenu, setActiveColumnMenu] = useState(null);
    const [columnMenuPosition, setColumnMenuPosition] = useState({ top: 0, left: 0 });
    const menuRef = useRef(null);

    // Temp hardcoded data - change to dynamic (fetching from database)
    const tempRowData = [
        {
            task: "Build login",
            status: "In progress",
            owner: "Charlie"
        },
        {
            task: "Build register",
            status: "In progress",
            owner: "Ben"
        },
        {
            task: "Authentication System",
            status: "Not started",
            owner: "Adam"
        },
        {
            task: "Landing page",
            status: "Not started",
            owner: "Emilia"
        }
    ];

    const tempColData = [
        {
            key: "task",
            label: "Task",
            inputType: "text",
        },
        {
            key: "status",
            label: "Status",
            inputType: "select",
            options: ["Not started", "In progress", "Completed", "On hold"]
        },
        {
            key: "owner",
            label: "Owner",
            inputType: "select",
            options: ["Charlie", "Ben", "Adam", "Emilia", "Sarah", "Mike"]
        }
    ];

    // Use useEffect to set the initial state only once after the component mounts
    useEffect(() => {
        setColumns(tempColData);
        setRows(tempRowData);
    }, []); // Empty dependency array ensures this runs only once

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setActiveColumnMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Function for updating the data in the table with the user's input
    const handleCellChange = (rowIndex, colKey, value) => {
        const updated = [...rows];
        updated[rowIndex][colKey] = value;
        setRows(updated);
    };

    // Handle column header click
    const handleColumnClick = (columnIndex, event) => {
        event.stopPropagation();

        if (activeColumnMenu === columnIndex) {
            setActiveColumnMenu(null);
            return;
        }

        // Calculate position for the dropdown
        const rect = event.currentTarget.getBoundingClientRect();
        setColumnMenuPosition({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX
        });

        setActiveColumnMenu(columnIndex);
    };

    // Column management functions
    const handleRenameColumn = (columnIndex) => {
        const newLabel = prompt("Enter new column name:", columns[columnIndex].label);
        if (newLabel && newLabel.trim()) {
            const updated = [...columns];
            updated[columnIndex].label = newLabel.trim();
            setColumns(updated);
        }
        setActiveColumnMenu(null);
    };

    const handleChangeColumnType = (columnIndex, newType) => {
        const updated = [...columns];
        updated[columnIndex].inputType = newType;

        // Add default options for select type
        if (newType === "select" && !updated[columnIndex].options) {
            updated[columnIndex].options = ["Option 1", "Option 2", "Option 3"];
        }

        setColumns(updated);
        setActiveColumnMenu(null);
    };

    const handleDeleteColumn = (columnIndex) => {
        if (columns.length <= 1) {
            alert("Cannot delete the last column");
            return;
        }

        const columnKey = columns[columnIndex].key;
        const updatedColumns = columns.filter((_, index) => index !== columnIndex);
        const updatedRows = rows.map(row => {
            const newRow = { ...row };
            delete newRow[columnKey];
            return newRow;
        });

        setColumns(updatedColumns);
        setRows(updatedRows);
        setActiveColumnMenu(null);
    };

    const handleDuplicateColumn = (columnIndex) => {
        const columnToDuplicate = { ...columns[columnIndex] };
        columnToDuplicate.label = `${columnToDuplicate.label} Copy`;
        columnToDuplicate.key = `${columnToDuplicate.key}_copy_${Date.now()}`;

        const updatedColumns = [...columns];
        updatedColumns.splice(columnIndex + 1, 0, columnToDuplicate);

        // Add empty values for the new column in all rows
        const updatedRows = rows.map(row => ({
            ...row,
            [columnToDuplicate.key]: ""
        }));

        setColumns(updatedColumns);
        setRows(updatedRows);
        setActiveColumnMenu(null);
    };

    const createNewColumn = () => {
        const newColumnKey = `newColumn_${Date.now()}`; // Unique key for the new column
        const newColumn = {
            key: newColumnKey,
            label: "New column",
            inputType: "text",
        };

        // Update columns state
        setColumns([...columns, newColumn]);

        // Update rows state by adding an empty value for the new column in each row
        const updatedRows = rows.map(row => ({
            ...row,
            [newColumnKey]: "" // Initialize with an empty string or default value
        }));
        setRows(updatedRows);
    };

    // Function to render different input types based on column configuration
    const rowRenderInput = (row, column, rowIndex) => {
        const baseClasses = "w-full bg-transparent outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-md p-1";

        switch (column.inputType) {
            case "text":
                return (
                    <input
                        type="text"
                        value={row[column.key] || ""}
                        onChange={(e) => handleCellChange(rowIndex, column.key, e.target.value)}
                        className={baseClasses}
                    />
                );

            case "select":
                return (
                    <select
                        value={row[column.key] || ""}
                        onChange={(e) => handleCellChange(rowIndex, column.key, e.target.value)}
                        className={`${baseClasses} cursor-pointer`}
                    >
                        <option value="">Select...</option>
                        {column.options?.map((option, optIndex) => (
                            <option key={optIndex} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                );

            case "number":
                return (
                    <input
                        type="number"
                        value={row[column.key] || ""}
                        onChange={(e) => handleCellChange(rowIndex, column.key, e.target.value)}
                        className={baseClasses}
                    />
                );

            case "date":
                return (
                    <input
                        type="date"
                        value={row[column.key] || ""}
                        onChange={(e) => handleCellChange(rowIndex, column.key, e.target.value)}
                        className={baseClasses}
                    />
                );

            case "checkbox":
                return (
                    <input
                        type="checkbox"
                        checked={row[column.key] === true || row[column.key] === "true"}
                        onChange={(e) => handleCellChange(rowIndex, column.key, e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                );

            case "textarea":
                return (
                    <textarea
                        value={row[column.key] || ""}
                        onChange={(e) => handleCellChange(rowIndex, column.key, e.target.value)}
                        className={`${baseClasses} resize-none min-h-[60px]`}
                        rows="2"
                    />
                );

            default:
                return (
                    <input
                        type="text"
                        value={row[column.key] || ""}
                        onChange={(e) => handleCellChange(rowIndex, column.key, e.target.value)}
                        className={baseClasses}
                    />
                );
        }
    };

    // Column dropdown menu component
    const ColumnDropdownMenu = ({ columnIndex, column }) => (
        <div
            ref={menuRef}
            className="fixed w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-[9999]"
            style={{
                top: `${columnMenuPosition.top}px`,
                left: `${columnMenuPosition.left}px`
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="py-1">
                <button
                    onClick={() => handleRenameColumn(columnIndex)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    Rename
                </button>

                <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600">
                    Property Type
                </div>

                <button
                    onClick={() => handleChangeColumnType(columnIndex, "text")}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        column.inputType === "text" 
                            ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" 
                            : "text-gray-700 dark:text-gray-300"
                    }`}
                >
                    📝 Text
                </button>

                <button
                    onClick={() => handleChangeColumnType(columnIndex, "select")}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        column.inputType === "select" 
                            ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" 
                            : "text-gray-700 dark:text-gray-300"
                    }`}
                >
                    🏷️ Select
                </button>

                <button
                    onClick={() => handleChangeColumnType(columnIndex, "number")}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        column.inputType === "number" 
                            ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" 
                            : "text-gray-700 dark:text-gray-300"
                    }`}
                >
                    🔢 Number
                </button>

                <button
                    onClick={() => handleChangeColumnType(columnIndex, "date")}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        column.inputType === "date" 
                            ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" 
                            : "text-gray-700 dark:text-gray-300"
                    }`}
                >
                    📅 Date
                </button>

                <button
                    onClick={() => handleChangeColumnType(columnIndex, "checkbox")}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        column.inputType === "checkbox" 
                            ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20" 
                            : "text-gray-700 dark:text-gray-300"
                    }`}
                >
                    ☑️ Checkbox
                </button>

                <div className="border-t border-gray-200 dark:border-gray-600 mt-1">
                    <button
                        onClick={() => handleDuplicateColumn(columnIndex)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Duplicate
                    </button>
                    <button
                        onClick={() => handleDeleteColumn(columnIndex)}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="justify-center">
            {/* Table Function Bar*/}
            <div className="flex items-center justify-between mb-2 px-8 pt-2 ">
                <div className="flex items-center space-x-3">
                    <button
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        onClick={createNewColumn}>
                        <span className="text-lg">+</span>
                    </button>
                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
                    <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                        Filter
                    </button>
                    <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                        Sort
                    </button>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                        •••
                    </button>
                </div>
            </div>

            {/* Table Component */}
            <div className="w-full h-full overflow-auto bg-white dark:bg-gray-950 p-6 pt-2 text-sm text-gray-900 dark:text-white">
                <table className="min-w-full border-collapse border border-gray-400 dark:border-gray-800 rounded-lg overflow-hidden">
                    <thead className="bg-gray-200 dark:bg-gray-700">
                        <tr>
                            {/* Dynamic column rendering */}
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className="p-3 text-left font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                    onClick={(e) => handleColumnClick(index, e)}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{column.label}</span>
                                        <span className="text-gray-400 ml-2">⌄</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Dynamic record rendering */}
                        {rows.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className="bg-white dark:bg-gray-900 even:bg-gray-50 dark:even:bg-gray-800 transition-colors duration-200"
                            >
                                {/* Adding the input field to the record*/}
                                {columns.map((column, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className="p-3 border-b border-gray-200 dark:border-gray-700"
                                    >
                                        {rowRenderInput(row, column, rowIndex)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Render dropdown menu outside of table */}
                {activeColumnMenu !== null && (
                    <ColumnDropdownMenu
                        columnIndex={activeColumnMenu}
                        column={columns[activeColumnMenu]}
                    />
                )}
            </div>
        </div>
    );
};

export default WorkspaceTable;