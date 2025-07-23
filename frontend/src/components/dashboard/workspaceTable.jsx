import { useState, useEffect, useRef } from "react";

const WorkspaceTable = () => {
    // State to manage the table's columns (array of column objects)
    const [columns, setColumns] = useState([]);
    // State to manage the table's rows (array of row objects, each representing a record)
    const [rows, setRows] = useState([]);
    // State to track which column's menu is currently active (null if none)
    const [activeColumnMenu, setActiveColumnMenu] = useState(null);
    // State to store the position of the column menu for dynamic display
    const [columnMenuPosition, setColumnMenuPosition] = useState({ top: 0, left: 0 });
    // Ref for detecting clicks outside the column menu to close it
    const menuRef = useRef(null);

    // State for current user information, used to determine organization ID for data fetching/saving
    const [currentUserInfo, setCurrentUserInfo] = useState(null);
    // State for the workspace title, displayed and saved with the table data
    const [workspaceTitle, setWorkspaceTitle] = useState("Untitled Workspace");
    // State for optional workspace content/description
    const [workspaceContent, setWorkspaceContent] = useState("");
    // State to indicate if data is currently being saved to the backend
    const [isSaving, setIsSaving] = useState(false);

    // State to track which row's menu is currently active (null if none)
    const [activeRowMenu, setActiveRowMenu] = useState(null);
    // State to store the position of the row menu for dynamic display
    const [rowMenuPosition, setRowMenuPosition] = useState({ top: 0, left: 0 });
    // Ref for detecting clicks outside the row menu to close it
    const rowMenuRef = useRef(null);

    // Base URL for API calls, fetched from environment variables
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // A ref to track if it's the component's initial mount to prevent immediate auto-save
    const isInitialMount = useRef(true);

    /**
     * Effect Hook: Fetches current user information on component mount.
     * This is crucial for obtaining the organization ID needed to fetch/save workspace data.
     */
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/user-auth/fetchCurrentUser`, {
                    method: 'GET',
                    credentials: 'include', // Important for sending cookies/session info
                    headers: {
                        'content-type': 'application/json',
                        'Accept': 'application/json',
                    }
                });

                const result = await response.json();
                setCurrentUserInfo(result.user);

            } catch (error) {
                console.log("Error fetching current user:", error);
            }
        }

        fetchCurrentUser();
    }, []); // Empty dependency array means this runs only once on initial component mount

    /**
     * Effect Hook: Fetches workspace table data when the current organization ID becomes available.
     * This loads the table structure (columns) and content (rows) from the backend.
     */
    useEffect(() => {
        const fetchWorkspaceTableData = async () => {
            // Only proceed if currentOrgId exists
            if (!currentUserInfo?.currentOrgId) {
                console.log("No organization ID available, skipping data fetch.");
                // Clear existing data if no org ID, or on initial load before ID is known
                setColumns([]);
                setRows([]);
                return;
            }

            try {
                const response = await fetch(`${backendUrl}/api/workspace/fetchWorkspaceTableData`, {
                    method: "GET",
                    credentials: 'include',
                    headers: {
                        'content-type': 'application/json',
                        'Accept': 'application/json',
                    }
                });

                const data = await response.json();

                // Handle non-OK HTTP responses (e.g., 401, 500)
                if (!response.ok) {
                    console.error("Failed to fetch workspace data:", data.message || response.statusText);
                    setColumns([]); // Clear data on fetch error
                    setRows([]);
                    return;
                }

                // Update states with fetched data, providing empty arrays as fallbacks
                setColumns(data.columns || []);
                setRows(data.rows || []);
                setWorkspaceTitle(data.title || "Untitled Workspace"); // Load existing title
                setWorkspaceContent(data.content || ""); // Load existing content

            } catch (error) {
                console.error("Error fetching workspace table data:", error);
                setColumns([]); // Clear on network error
                setRows([]);
            }
        };

        // Trigger fetch only when currentUserInfo.currentOrgId is valid
        if (currentUserInfo?.currentOrgId) {
            fetchWorkspaceTableData();
        }
    }, [currentUserInfo?.currentOrgId]); // Re-run this effect when currentOrgId changes

    /**
     * Effect Hook: Implements auto-save functionality with a debounce mechanism.
     * Saves `columns`, `rows`, `workspaceTitle`, and `workspaceContent` to the backend
     * whenever they change, but only after a short delay (1 second) to bundle multiple rapid changes.
     */
    useEffect(() => {
        // Prevent saving on the very first render after initial data fetch
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // Do not attempt to save if organization ID is not available
        if (!currentUserInfo?.currentOrgId) {
            console.log("No organization ID available, skipping auto-save.");
            return;
        }

        setIsSaving(true); // Set saving status to true to show UI feedback

        // Set a timeout to perform the save operation
        const saveDebounced = setTimeout(async () => {
            try {
                const response = await fetch(`${backendUrl}/api/workspace/updateOrCreateWorkspaceData`, {
                    method: "POST",
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        orgId: currentUserInfo.currentOrgId, // Organization ID for data association
                        title: workspaceTitle,
                        content: workspaceContent,
                        columns: columns,
                        rows: rows,
                    }),
                });

                const result = await response.json();

                if (response.ok) {
                    console.log("Workspace data saved successfully:", result.message);
                } else {
                    console.error("Failed to save workspace data:", result.message || response.statusText);
                }
            } catch (error) {
                console.error("Error saving workspace data:", error);
            } finally {
                setIsSaving(false); // Reset saving status regardless of success or failure
            }
        }, 1000); // 1000ms (1 second) debounce time

        // Cleanup function: Clears the timeout if any dependencies change before the timeout expires.
        // This prevents unnecessary API calls for rapid consecutive changes.
        return () => clearTimeout(saveDebounced);

    }, [columns, rows, workspaceTitle, workspaceContent, currentUserInfo?.currentOrgId]); // Dependencies that trigger this effect

    /**
     * Effect Hook: Handles closing dropdown menus when a click occurs outside of them.
     */
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close column menu if click is outside its ref
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setActiveColumnMenu(null);
            }
            // Close row menu if click is outside its ref
            if (rowMenuRef.current && !rowMenuRef.current.contains(event.target)) {
                setActiveRowMenu(null);
            }
        };

        // Add event listener when component mounts
        document.addEventListener('mousedown', handleClickOutside);
        // Clean up event listener when component unmounts or dependencies change
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

    /**
     * Handles changes in individual table cells (input fields).
     * @param {number} rowIndex - The index of the row being updated.
     * @param {string} colKey - The unique key of the column being updated.
     * @param {*} value - The new value from the input field.
     */
    const handleCellChange = (rowIndex, colKey, value) => {
        const updated = [...rows]; // Create a shallow copy of the rows array
        updated[rowIndex][colKey] = value; // Update the specific cell's value
        setRows(updated); // Update the state, triggering re-render and auto-save
    };

    /**
     * Handles clicks on column headers to open/close the column menu.
     * @param {number} columnIndex - The index of the clicked column.
     * @param {object} event - The click event object.
     */
    const handleColumnClick = (columnIndex, event) => {
        event.stopPropagation(); // Prevent event from bubbling up and closing other menus
        setActiveRowMenu(null); // Close any active row menu when a column menu is opened

        // Toggle the column menu: close if already open, open otherwise
        if (activeColumnMenu === columnIndex) {
            setActiveColumnMenu(null);
            return;
        }

        // Calculate position for the dropdown menu based on the clicked header's position
        const rect = event.currentTarget.getBoundingClientRect();
        setColumnMenuPosition({
            top: rect.bottom + window.scrollY, // Position below the header
            left: rect.left + window.scrollX  // Align with the header's left edge
        });

        setActiveColumnMenu(columnIndex); // Set the clicked column as the active menu
    };

    /**
     * Handles clicks on the row menu button (•••) to open/close the row menu.
     * @param {number} rowIndex - The index of the row whose menu button was clicked.
     * @param {object} event - The click event object.
     */
    const handleRowMenuClick = (rowIndex, event) => {
        event.stopPropagation(); // Prevent event from bubbling up and closing other menus
        setActiveColumnMenu(null); // Close any active column menu when a row menu is opened

        // Toggle the row menu: close if already open, open otherwise
        if (activeRowMenu === rowIndex) {
            setActiveRowMenu(null);
            return;
        }

        // Calculate position for the dropdown menu
        const rect = event.currentTarget.getBoundingClientRect();
        setRowMenuPosition({
            top: rect.bottom + window.scrollY, // Position below the button
            left: rect.left + window.scrollX  // Align with the button's left edge
        });

        setActiveRowMenu(rowIndex); // Set the clicked row as having the active menu
    };

    /**
     * Renames a column based on user input.
     * @param {number} columnIndex - The index of the column to rename.
     */
    const handleRenameColumn = (columnIndex) => {
        const newLabel = prompt("Enter new column name:", columns[columnIndex].label);
        if (newLabel && newLabel.trim()) { // Ensure new label is not empty or just whitespace
            const updated = [...columns];
            updated[columnIndex].label = newLabel.trim();
            setColumns(updated); // Update columns state
        }
        setActiveColumnMenu(null); // Close the menu
    };

    /**
     * Changes the input type of a column (e.g., text, number, select).
     * @param {number} columnIndex - The index of the column to modify.
     * @param {string} newType - The new input type (e.g., "text", "select", "number").
     */
    const handleChangeColumnType = (columnIndex, newType) => {
        const updated = [...columns];
        updated[columnIndex].inputType = newType;

        // If changing to 'select' and no options exist, add default ones
        if (newType === "select" && !updated[columnIndex].options) {
            updated[columnIndex].options = ["Option 1", "Option 2", "Option 3"];
        }

        setColumns(updated); // Update columns state
        setActiveColumnMenu(null); // Close the menu
    };

    /**
     * Deletes a column and its corresponding data from all rows.
     * Prevents deletion if it's the last column.
     * @param {number} columnIndex - The index of the column to delete.
     */
    const handleDeleteColumn = (columnIndex) => {
        if (columns.length <= 1) { // Prevent deleting the last column
            alert("Cannot delete the last column");
            return;
        }

        const columnKey = columns[columnIndex].key; // Get the unique key of the column to be deleted
        // Filter out the column from the columns array
        const updatedColumns = columns.filter((_, index) => index !== columnIndex);
        // Remove the corresponding data from each row
        const updatedRows = rows.map(row => {
            const newRow = { ...row }; // Create a copy of the row
            delete newRow[columnKey]; // Delete the property corresponding to the column key
            return newRow;
        });

        setColumns(updatedColumns); // Update columns state
        setRows(updatedRows);     // Update rows state
        setActiveColumnMenu(null); // Close the menu
    };

    /**
     * Duplicates an existing column, appending " Copy" to its label.
     * @param {number} columnIndex - The index of the column to duplicate.
     */
    const handleDuplicateColumn = (columnIndex) => {
        const columnToDuplicate = { ...columns[columnIndex] }; // Create a shallow copy of the column object
        columnToDuplicate.label = `${columnToDuplicate.label} Copy`; // Append " Copy" to the new label
        columnToDuplicate.key = `${columnToDuplicate.key}_copy_${Date.now()}`; // Create a new unique key

        const updatedColumns = [...columns];
        updatedColumns.splice(columnIndex + 1, 0, columnToDuplicate); // Insert the new column next to the original

        // Add an empty value for the new column in all existing rows
        const updatedRows = rows.map(row => ({
            ...row,
            [columnToDuplicate.key]: "" // Initialize with an empty string
        }));

        setColumns(updatedColumns); // Update columns state
        setRows(updatedRows);     // Update rows state
        setActiveColumnMenu(null); // Close the menu
    };

    /**
     * Creates a new column with a default label and text input type.
     * Adds an empty value for this new column to all existing rows.
     */
    const createNewColumn = () => {
        const newColumnKey = `newColumn_${Date.now()}`; // Generate a unique key for the new column
        const newColumn = {
            key: newColumnKey,
            label: "New column",
            inputType: "text", // Default type is text
        };

        setColumns([...columns, newColumn]); // Add the new column to the columns state

        // For each existing row, add a new property for the new column, initialized to empty string
        const updatedRows = rows.map(row => ({
            ...row,
            [newColumnKey]: ""
        }));
        setRows(updatedRows); // Update rows state
    };

    /**
     * Creates a new row, initializing each cell based on the corresponding column's input type.
     */
    const createNewRow = () => {
        const newRow = {}; // Initialize an empty object for the new row
        // Iterate over existing columns to populate the new row with default values
        columns.forEach(column => {
            if (column.inputType === "checkbox") {
                newRow[column.key] = false; // Checkboxes default to false
            } else if (column.inputType === "number") {
                newRow[column.key] = 0; // Numbers default to 0
            } else {
                newRow[column.key] = ""; // All other types default to an empty string
            }
        });
        setRows([...rows, newRow]); // Add the newly created row to the rows state
    };

    /**
     * Deletes a specific row from the table.
     * @param {number} rowIndexToDelete - The index of the row to be deleted.
     */
    const handleDeleteRow = (rowIndexToDelete) => {
        // Filter out the row at the given index
        const updatedRows = rows.filter((_, index) => index !== rowIndexToDelete);
        setRows(updatedRows); // Update rows state
        setActiveRowMenu(null); // Close the row menu after deletion
    };

    /**
     * Renders the appropriate input component for a table cell based on its column's input type.
     * @param {object} row - The current row object.
     * @param {object} column - The current column object (contains inputType).
     * @param {number} rowIndex - The index of the current row.
     * @returns {JSX.Element} - The React input element.
     */
    const rowRenderInput = (row, column, rowIndex) => {
        // Common CSS classes for input fields
        const baseClasses = "w-full bg-transparent outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-md p-1";

        switch (column.inputType) {
            case "text":
                return (
                    <input
                        type="text"
                        value={row[column.key] || ""} // Ensure value is controlled; default to empty string
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
                        <option value="">Select...</option> {/* Default empty option */}
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
                        // Convert string "true"/"false" from backend to boolean
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
                        className={`${baseClasses} resize-none min-h-[60px]`} // Allow vertical resizing
                        rows="2" // Initial number of rows
                    />
                );

            default:
                // Fallback for unknown types, or if inputType is missing
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

    /**
     * ColumnDropdownMenu Component: Renders the dropdown menu for column options (rename, change type, delete, etc.).
     * @param {number} columnIndex - The index of the column this menu belongs to.
     * @param {object} column - The column object for current state.
     */
    const ColumnDropdownMenu = ({ columnIndex, column }) => (
        <div
            ref={menuRef} // Attach ref for click outside detection
            className="fixed w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-[9999]"
            style={{
                top: `${columnMenuPosition.top}px`,
                left: `${columnMenuPosition.left}px`
            }}
            onClick={(e) => e.stopPropagation()} // Prevent closing immediately on internal clicks
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

                {/* Buttons to change column input type, with active state highlighting */}
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

    /**
     * RowDropdownMenu Component: Renders the dropdown menu for row options (e.g., delete row).
     * @param {number} rowIndex - The index of the row this menu belongs to.
     */
    const RowDropdownMenu = ({ rowIndex }) => (
        <div
            ref={rowMenuRef} // Attach ref for click outside detection
            className="fixed w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-[9999]"
            style={{
                top: `${rowMenuPosition.top}px`,
                left: `${rowMenuPosition.left}px`
            }}
            onClick={(e) => e.stopPropagation()} // Prevent closing immediately on internal clicks
        >
            <div className="py-1">
                <button
                    onClick={() => handleDeleteRow(rowIndex)}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                    Delete Row
                </button>
            </div>
        </div>
    );


    return (
        <div className="justify-center">
            {/* Table Function Bar: Contains buttons for adding columns/rows and other table actions */}
            <div className="flex items-center justify-between mb-2 px-8 pt-2 ">
                <div className="flex items-center space-x-3">
                    <button
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        onClick={createNewColumn}>
                        <span className="text-lg">+ Column</span>
                    </button>
                    <button
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        onClick={createNewRow}>
                        <span className="text-lg">+ Row</span>
                    </button>
                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div> {/* Visual separator */}
                    <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                        Filter
                    </button>
                    <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                        Sort
                    </button>
                </div>
                <div className="flex items-center space-x-3">
                    {/* Display saving status */}
                    {isSaving && <span className="text-sm text-gray-500 dark:text-gray-400">Saving...</span>}
                    <button
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                        •••
                    </button>
                </div>
            </div>

            {/* Workspace Title & Content Input Section */}
            <div className="px-8 mb-4">
                <input
                    type="text"
                    className="w-full text-2xl font-bold bg-transparent border-none outline-none focus:ring-0 focus:border-transparent dark:text-white text-gray-900"
                    value={workspaceTitle}
                    onChange={(e) => setWorkspaceTitle(e.target.value)}
                    placeholder="Enter workspace title..."
                />
                 <textarea
                    className="w-full text-sm bg-transparent border-none outline-none focus:ring-0 focus:border-transparent dark:text-gray-300 text-gray-600 resize-none"
                    value={workspaceContent}
                    onChange={(e) => setWorkspaceContent(e.target.value)}
                    placeholder="Add a description to your workspace..."
                    rows="2"
                />
            </div>


            {/* Main Table Component Area */}
            <div className="w-full h-full overflow-auto bg-white dark:bg-gray-950 p-6 pt-2 text-sm text-gray-900 dark:text-white">
                <table className="min-w-full border-collapse border border-gray-400 dark:border-gray-800 rounded-lg overflow-hidden">
                    <thead className="bg-gray-200 dark:bg-gray-700">
                        <tr>
                            {/* Empty header for the row menu button column.
                                This ensures alignment with the row menu buttons in tbody. */}
                            <th className="w-8 p-3 text-left font-semibold border-b border-gray-300 dark:border-gray-600"></th>
                            {/* Dynamically render table headers based on the 'columns' state */}
                            {columns.map((column, index) => (
                                <th
                                    key={column.key || index} // Use unique column.key for better React list performance
                                    className="p-3 text-left font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                    onClick={(e) => handleColumnClick(index, e)}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{column.label}</span>
                                        <span className="text-gray-400 ml-2">⌄</span> {/* Visual indicator for dropdown */}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Dynamically render table rows based on the 'rows' state */}
                        {rows.map((row, rowIndex) => (
                            <tr
                                key={rowIndex} // Use rowIndex as key, assuming row order might change. For stable IDs, use a unique row ID.
                                className="bg-white dark:bg-gray-900 even:bg-gray-50 dark:even:bg-gray-800 transition-colors duration-200 group relative" // 'group' for hover effects, 'relative' for positioning menu button
                            >
                                {/* Row menu button cell */}
                                <td className="p-3 border-b border-gray-200 dark:border-gray-700 relative">
                                    <button
                                        onClick={(e) => handleRowMenuClick(rowIndex, e)}
                                        // Position button absolutely within the cell
                                        // Make it slightly visible (opacity-50) by default and fully visible on row hover (group-hover:opacity-100)
                                        // Add transition for smooth hover effect
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-md text-gray-500 dark:text-gray-400 opacity-50 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        aria-label="Row options" // Accessibility label
                                    >
                                        •••
                                    </button>
                                </td>
                                {/* Render cells for each column in the current row */}
                                {columns.map((column, colIndex) => (
                                    <td
                                        key={column.key || colIndex} // Use unique column.key for better React list performance
                                        className="p-3 border-b border-gray-200 dark:border-gray-700"
                                    >
                                        {rowRenderInput(row, column, rowIndex)} {/* Render appropriate input type */}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Render the Column Dropdown Menu only if a column menu is active */}
                {activeColumnMenu !== null && (
                    <ColumnDropdownMenu
                        columnIndex={activeColumnMenu}
                        column={columns[activeColumnMenu]}
                    />
                )}
                {/* Render the Row Dropdown Menu only if a row menu is active */}
                {activeRowMenu !== null && (
                    <RowDropdownMenu rowIndex={activeRowMenu} />
                )}
            </div>
        </div>
    );
};

export default WorkspaceTable;