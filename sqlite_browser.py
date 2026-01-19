#!/usr/bin/env python3
"""
SQLite Database Browser - Web Interface
Access via: http://localhost:8888
"""

from flask import Flask, render_template_string, request, jsonify
import sqlite3
import os
import json

app = Flask(__name__)

DB_PATH = r"c:\Users\OM\Downloads\INSURANCE ASIS APPLICATION\Training\Training\backend\app\users.db"

def connect_db():
    """Connect to SQLite database"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    """Main page"""
    conn = connect_db()
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall()]
    conn.close()
    
    return render_template_string(HTML_TEMPLATE, tables=tables)

@app.route('/api/table/<table_name>')
def get_table_data(table_name):
    """Get data from a specific table"""
    try:
        conn = connect_db()
        cursor = conn.cursor()
        
        # Get table data
        cursor.execute(f"SELECT * FROM {table_name}")
        columns = [description[0] for description in cursor.description]
        rows = cursor.fetchall()
        
        # Get row count
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        
        conn.close()
        
        return jsonify({
            'success': True,
            'table': table_name,
            'columns': columns,
            'rows': [dict(row) for row in rows],
            'count': count
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/tables')
def get_tables():
    """Get list of all tables"""
    try:
        conn = connect_db()
        cursor = conn.cursor()
        
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
        tables = [row[0] for row in cursor.fetchall()]
        
        # Get table sizes
        table_info = {}
        for table in tables:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            count = cursor.fetchone()[0]
            table_info[table] = count
        
        conn.close()
        
        return jsonify({'success': True, 'tables': table_info})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/query', methods=['POST'])
def execute_query():
    """Execute custom SQL query"""
    try:
        data = request.json
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({'success': False, 'error': 'Query is required'}), 400
        
        conn = connect_db()
        cursor = conn.cursor()
        
        # Execute query
        cursor.execute(query)
        
        if query.upper().startswith('SELECT'):
            columns = [description[0] for description in cursor.description]
            rows = cursor.fetchall()
            
            return jsonify({
                'success': True,
                'columns': columns,
                'rows': [dict(row) for row in rows],
                'count': len(rows)
            })
        else:
            conn.commit()
            return jsonify({
                'success': True,
                'message': f'Query executed. {cursor.rowcount} rows affected.'
            })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    finally:
        conn.close()

HTML_TEMPLATE = '''
<!DOCTYPE html>
<html>
<head>
    <title>SQLite Database Browser - Insurance ASIS</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            display: flex;
            overflow: hidden;
            height: 90vh;
        }
        
        .sidebar {
            width: 250px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: white;
            padding: 20px;
            overflow-y: auto;
            border-right: 3px solid #667eea;
        }
        
        .sidebar h3 {
            margin-bottom: 20px;
            font-size: 16px;
            color: #667eea;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .sidebar ul {
            list-style: none;
        }
        
        .sidebar li {
            margin-bottom: 8px;
        }
        
        .sidebar a {
            display: block;
            padding: 10px 12px;
            background: rgba(102, 126, 234, 0.1);
            border-radius: 5px;
            color: white;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.3s;
            border-left: 3px solid transparent;
        }
        
        .sidebar a:hover {
            background: rgba(102, 126, 234, 0.3);
            border-left-color: #667eea;
        }
        
        .sidebar a.active {
            background: #667eea;
            border-left-color: white;
        }
        
        .main {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            font-size: 24px;
            margin-bottom: 5px;
        }
        
        .header p {
            opacity: 0.9;
            font-size: 14px;
        }
        
        .content {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
        }
        
        .table-wrapper {
            overflow-x: auto;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border: 1px solid #ddd;
            border-radius: 5px;
            overflow: hidden;
        }
        
        th {
            background: #f5f5f5;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #333;
            border-bottom: 2px solid #ddd;
        }
        
        td {
            padding: 10px 12px;
            border-bottom: 1px solid #eee;
            word-break: break-word;
            max-width: 300px;
        }
        
        tr:hover {
            background: #f9f9f9;
        }
        
        .info {
            background: #e8f4f8;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 5px;
            color: #333;
        }
        
        .info strong {
            color: #1a1a2e;
        }
        
        .loading {
            text-align: center;
            padding: 40px;
            color: #666;
        }
        
        .query-box {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        
        .query-box textarea {
            width: 100%;
            height: 100px;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
        }
        
        .query-box button {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 10px;
            font-weight: 600;
        }
        
        .query-box button:hover {
            background: #5568d3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="sidebar">
            <h3>📊 Tables</h3>
            <ul id="table-list">
                <li><a onclick="loadTable('users')">users</a></li>
                <li><a onclick="loadTable('insurance_policies')">insurance_policies</a></li>
                <li><a onclick="loadTable('claims')">claims</a></li>
                <li><a onclick="loadTable('claim_history')">claim_history</a></li>
                <li><a onclick="loadTable('policy_recommendations')">policy_recommendations</a></li>
            </ul>
            
            <h3 style="margin-top: 30px;">⚙️ Tools</h3>
            <div class="query-box">
                <textarea id="query-input" placeholder="Enter SQL query..."></textarea>
                <button onclick="executeQuery()">Execute Query</button>
            </div>
        </div>
        
        <div class="main">
            <div class="header">
                <h1>🔐 SQLite Database Browser</h1>
                <p>Insurance ASIS Application - Real-time Data Viewer</p>
            </div>
            
            <div class="content">
                <div id="content-area">
                    <div class="loading">
                        <p>Select a table from the left to view data</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        function loadTable(tableName) {
            const contentArea = document.getElementById('content-area');
            contentArea.innerHTML = '<div class="loading">Loading...</div>';
            
            fetch(`/api/table/${tableName}`)
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        displayTable(data);
                        
                        // Update active tab
                        document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
                        event.target.classList.add('active');
                    } else {
                        contentArea.innerHTML = `<div class="info">Error: ${data.error}</div>`;
                    }
                })
                .catch(error => {
                    contentArea.innerHTML = `<div class="info">Error: ${error}</div>`;
                });
        }
        
        function displayTable(data) {
            const columns = data.columns;
            const rows = data.rows;
            
            let html = `<div class="info">
                <strong>Table:</strong> ${data.table} | 
                <strong>Total Records:</strong> ${data.count}
            </div>`;
            
            html += '<div class="table-wrapper"><table>';
            
            // Headers
            html += '<thead><tr>';
            columns.forEach(col => {
                html += `<th>${col}</th>`;
            });
            html += '</tr></thead>';
            
            // Rows
            html += '<tbody>';
            rows.forEach(row => {
                html += '<tr>';
                columns.forEach(col => {
                    let value = row[col];
                    if (value === null) value = 'NULL';
                    else if (typeof value === 'object') value = JSON.stringify(value);
                    html += `<td>${value}</td>`;
                });
                html += '</tr>';
            });
            html += '</tbody></table></div>';
            
            document.getElementById('content-area').innerHTML = html;
        }
        
        function executeQuery() {
            const query = document.getElementById('query-input').value;
            if (!query.trim()) {
                alert('Please enter a query');
                return;
            }
            
            const contentArea = document.getElementById('content-area');
            contentArea.innerHTML = '<div class="loading">Executing query...</div>';
            
            fetch('/api/query', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({query: query})
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    if (data.columns) {
                        displayTable({
                            table: 'Query Result',
                            columns: data.columns,
                            rows: data.rows,
                            count: data.count
                        });
                    } else {
                        contentArea.innerHTML = `<div class="info">✅ ${data.message}</div>`;
                    }
                } else {
                    contentArea.innerHTML = `<div class="info">❌ Error: ${data.error}</div>`;
                }
            })
            .catch(error => {
                contentArea.innerHTML = `<div class="info">❌ Error: ${error}</div>`;
            });
        }
        
        // Load first table on page load
        window.addEventListener('load', () => loadTable('users'));
    </script>
</body>
</html>
'''

if __name__ == '__main__':
    print("\n" + "="*80)
    print("🔐 SQLite Database Browser - Web Interface")
    print("="*80)
    print("\n✅ Database Browser running at: http://localhost:8888")
    print("✅ Press Ctrl+C to stop\n")
    app.run(host='localhost', port=8888, debug=True, use_reloader=False)
