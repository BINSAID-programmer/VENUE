#!/usr/bin/env python3
import json

CURRICULUM = {
    # 1. BSc Mathematics and Statistics (math-stats) - Dept of Math (conas)
    "math-stats": [
        # Y1 S1
        {"code": "MT 100", "title": "Basic Mathematics", "credits": 12, "year": 1, "sem": 1, "status": "Core"},
        {"code": "MT 114", "title": "Linear Algebra I", "credits": 12, "year": 1, "sem": 1, "status": "Core"},
        {"code": "ST 113", "title": "Basic Statistics", "credits": 12, "year": 1, "sem": 1, "status": "Core"},
        {"code": "CS 174", "title": "Programming in C", "credits": 12, "year": 1, "sem": 1, "status": "Core"},
        {"code": "DS 112", "title": "Development Perspectives I", "credits": 8, "year": 1, "sem": 1, "status": "Core"},
        # Y1 S2
        {"code": "MT 120", "title": "Calculus", "credits": 12, "year": 1, "sem": 2, "status": "Core"},
        {"code": "MT 127", "title": "Linear Algebra II", "credits": 12, "year": 1, "sem": 2, "status": "Core"},
        {"code": "ST 114", "title": "Probability Theory I", "credits": 12, "year": 1, "sem": 2, "status": "Core"},
        {"code": "ST 121", "title": "Calculus for Statistics", "credits": 12, "year": 1, "sem": 2, "status": "Core"},
        {"code": "CL 106", "title": "Communication Skills", "credits": 8, "year": 1, "sem": 2, "status": "Core"},
        # Y2 S1
        {"code": "MT 200", "title": "Advanced Calculus", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        {"code": "MT 233", "title": "Mathematical Analysis", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        {"code": "ST 210", "title": "Probability Theory II", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        {"code": "ST 211", "title": "Mathematical Statistics I", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        {"code": "ST 212", "title": "Statistical Inference I", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        # Y2 S2
        {"code": "MT 227", "title": "Ordinary Differential Equations", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "MT 278", "title": "Linear Programming", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "ST 215", "title": "Regression Analysis", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "ST 218", "title": "Sample Survey Design", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "ST 220", "title": "Statistical Computing I", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        # Y3 S1
        {"code": "MT 310", "title": "Complex Analysis", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        {"code": "MT 357", "title": "Numerical Analysis I", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        {"code": "ST 310", "title": "Statistical Inference II", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        {"code": "ST 312", "title": "Stochastic Processes", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        {"code": "ST 314", "title": "Design of Experiments", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        # Y3 S2
        {"code": "MT 378", "title": "Applied Optimisation", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
        {"code": "ST 316", "title": "Time Series Analysis", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
        {"code": "ST 317", "title": "Multivariate Analysis", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
        {"code": "ST 321", "title": "Statistical Computing II (R/Python)", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
        {"code": "MT 399", "title": "Undergraduate Research Project in Mathematics", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
    ],

    # 2. BSc Statistics (bsc-stats) - Dept of Statistics (coss)
    "bsc-stats": [
        # Y1 S1
        {"code": "ST 113", "title": "Basic Statistics", "credits": 12, "year": 1, "sem": 1, "status": "Core"},
        {"code": "ST 118", "title": "Exploratory Data Analysis", "credits": 12, "year": 1, "sem": 1, "status": "Core"},
        {"code": "MT 100", "title": "Basic Mathematics", "credits": 12, "year": 1, "sem": 1, "status": "Core"},
        {"code": "CS 174", "title": "Programming in C", "credits": 12, "year": 1, "sem": 1, "status": "Core"},
        {"code": "DS 112", "title": "Development Perspectives I", "credits": 8, "year": 1, "sem": 1, "status": "Core"},
        # Y1 S2
        {"code": "ST 114", "title": "Probability Theory I", "credits": 12, "year": 1, "sem": 2, "status": "Core"},
        {"code": "ST 121", "title": "Calculus for Statistics", "credits": 12, "year": 1, "sem": 2, "status": "Core"},
        {"code": "ST 122", "title": "Official Statistics & Demography I", "credits": 12, "year": 1, "sem": 2, "status": "Core"},
        {"code": "MT 127", "title": "Linear Algebra II", "credits": 12, "year": 1, "sem": 2, "status": "Core"},
        {"code": "CL 106", "title": "Communication Skills", "credits": 8, "year": 1, "sem": 2, "status": "Core"},
        # Y2 S1
        {"code": "ST 210", "title": "Probability Theory II", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        {"code": "ST 211", "title": "Mathematical Statistics I", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        {"code": "ST 212", "title": "Statistical Inference I", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        {"code": "ST 216", "title": "Biostatistics I", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        {"code": "MT 233", "title": "Mathematical Analysis", "credits": 12, "year": 2, "sem": 1, "status": "Elective"},
        # Y2 S2
        {"code": "ST 215", "title": "Regression Analysis", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "ST 218", "title": "Sample Survey Design", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "ST 220", "title": "Statistical Computing I", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "ST 223", "title": "Non-Parametric Statistical Methods", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "ST 224", "title": "Applied Demography", "credits": 12, "year": 2, "sem": 2, "status": "Elective"},
        # Y3 S1
        {"code": "ST 310", "title": "Statistical Inference II", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        {"code": "ST 312", "title": "Stochastic Processes", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        {"code": "ST 313", "title": "Applied Econometrics for Statisticians", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        {"code": "ST 314", "title": "Design of Experiments", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        {"code": "ST 318", "title": "Quality Control and Industrial Statistics", "credits": 12, "year": 3, "sem": 1, "status": "Elective"},
        # Y3 S2
        {"code": "ST 315", "title": "Biostatistics II & Survival Analysis", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
        {"code": "ST 316", "title": "Time Series Analysis", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
        {"code": "ST 317", "title": "Multivariate Analysis", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
        {"code": "ST 321", "title": "Statistical Computing II (R/Python)", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
        {"code": "ST 399", "title": "Undergraduate Research Project in Statistics", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
    ],

    # 3. BA Economics (ba-economics) - Dept of Economics (udse)
    "ba-economics": [
        # Y1 S1
        {"code": "EC 116", "title": "Principles of Microeconomics I", "credits": 12, "year": 1, "sem": 1, "status": "Core"},
        {"code": "EC 118", "title": "Introductory Mathematics for Economists", "credits": 12, "year": 1, "sem": 1, "status": "Core"},
        {"code": "ST 113", "title": "Basic Statistics", "credits": 12, "year": 1, "sem": 1, "status": "Core"},
        {"code": "DS 112", "title": "Development Perspectives I", "credits": 8, "year": 1, "sem": 1, "status": "Core"},
        {"code": "CL 106", "title": "Communication Skills", "credits": 8, "year": 1, "sem": 1, "status": "Core"},
        # Y1 S2
        {"code": "EC 117", "title": "Principles of Macroeconomics I", "credits": 12, "year": 1, "sem": 2, "status": "Core"},
        {"code": "EC 119", "title": "Introductory Calculus for Economists", "credits": 12, "year": 1, "sem": 2, "status": "Core"},
        {"code": "ST 114", "title": "Probability Theory I", "credits": 12, "year": 1, "sem": 2, "status": "Core"},
        {"code": "CS 101", "title": "Introduction to Computers and IT", "credits": 8, "year": 1, "sem": 2, "status": "Core"},
        # Y2 S1
        {"code": "EC 216", "title": "Intermediate Microeconomics I", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        {"code": "EC 218", "title": "Econometrics I", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        {"code": "EC 220", "title": "Development Economics I", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        {"code": "ST 210", "title": "Probability Theory II", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        # Y2 S2
        {"code": "EC 217", "title": "Intermediate Macroeconomics I", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "EC 219", "title": "Econometrics II", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "EC 221", "title": "Money and Banking", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "EC 224", "title": "Public Sector Economics", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        # Y3 S1
        {"code": "EC 316", "title": "International Trade Theory", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        {"code": "EC 318", "title": "Applied Econometrics", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        {"code": "EC 320", "title": "Agricultural Economics", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        {"code": "EC 322", "title": "Industrial Economics", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        # Y3 S2
        {"code": "EC 317", "title": "International Finance", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
        {"code": "EC 319", "title": "Environmental and Natural Resource Economics", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
        {"code": "EC 321", "title": "Health Economics", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
        {"code": "EC 399", "title": "Undergraduate Research Paper in Economics", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
    ],

    # 4. BA Economics and Statistics (ba-econ-stats) - Dept of Economics (udse)
    "ba-econ-stats": [
        # Y1 S1
        {"code": "EC 116", "title": "Principles of Microeconomics I", "credits": 12, "year": 1, "sem": 1, "status": "Core"},
        {"code": "ST 113", "title": "Basic Statistics", "credits": 12, "year": 1, "sem": 1, "status": "Core"},
        {"code": "MT 100", "title": "Basic Mathematics", "credits": 12, "year": 1, "sem": 1, "status": "Core"},
        {"code": "DS 112", "title": "Development Perspectives I", "credits": 8, "year": 1, "sem": 1, "status": "Core"},
        {"code": "CL 106", "title": "Communication Skills", "credits": 8, "year": 1, "sem": 1, "status": "Core"},
        # Y1 S2
        {"code": "EC 117", "title": "Principles of Macroeconomics I", "credits": 12, "year": 1, "sem": 2, "status": "Core"},
        {"code": "ST 114", "title": "Probability Theory I", "credits": 12, "year": 1, "sem": 2, "status": "Core"},
        {"code": "ST 121", "title": "Calculus for Statistics", "credits": 12, "year": 1, "sem": 2, "status": "Core"},
        {"code": "MT 127", "title": "Linear Algebra II", "credits": 12, "year": 1, "sem": 2, "status": "Core"},
        # Y2 S1
        {"code": "EC 216", "title": "Intermediate Microeconomics I", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        {"code": "ST 210", "title": "Probability Theory II", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        {"code": "ST 211", "title": "Mathematical Statistics I", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        {"code": "EC 218", "title": "Econometrics I", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        {"code": "ST 212", "title": "Statistical Inference I", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        # Y2 S2
        {"code": "EC 217", "title": "Intermediate Macroeconomics I", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "ST 215", "title": "Regression Analysis", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "ST 218", "title": "Sample Survey Design", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "EC 219", "title": "Econometrics II", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "ST 220", "title": "Statistical Computing I", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        # Y3 S1
        {"code": "EC 316", "title": "International Trade Theory", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        {"code": "ST 310", "title": "Statistical Inference II", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        {"code": "ST 312", "title": "Stochastic Processes", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        {"code": "EC 320", "title": "Agricultural Economics", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        {"code": "ST 314", "title": "Design of Experiments", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        # Y3 S2
        {"code": "EC 317", "title": "International Finance", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
        {"code": "ST 316", "title": "Time Series Analysis", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
        {"code": "ST 317", "title": "Multivariate Analysis", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
        {"code": "EC 321", "title": "Health Economics", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
        {"code": "EC 399", "title": "Undergraduate Research Paper in Economics", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
    ],

    # 5. BSc Computer Science (bsc-cs) - CoICT
    "bsc-cs": [
        # Y1 S1
        {"code": "CS 174", "title": "Programming in C", "credits": 12, "year": 1, "sem": 1, "status": "Core"},
        {"code": "IS 142", "title": "Discrete Structures", "credits": 12, "year": 1, "sem": 1, "status": "Core"},
        {"code": "MT 100", "title": "Basic Mathematics", "credits": 12, "year": 1, "sem": 1, "status": "Core"},
        {"code": "DS 112", "title": "Development Perspectives I", "credits": 8, "year": 1, "sem": 1, "status": "Core"},
        {"code": "CL 106", "title": "Communication Skills", "credits": 8, "year": 1, "sem": 1, "status": "Core"},
        # Y1 S2
        {"code": "CS 175", "title": "Object-Oriented Programming in Java", "credits": 12, "year": 1, "sem": 2, "status": "Core"},
        {"code": "CS 173", "title": "Digital Logic and Computer Architecture", "credits": 12, "year": 1, "sem": 2, "status": "Core"},
        {"code": "IS 158", "title": "Database Systems I", "credits": 12, "year": 1, "sem": 2, "status": "Core"},
        {"code": "MT 127", "title": "Linear Algebra II", "credits": 12, "year": 1, "sem": 2, "status": "Core"},
        {"code": "CS 176", "title": "Web Technologies", "credits": 8, "year": 1, "sem": 2, "status": "Core"},
        # Y2 S1
        {"code": "CS 234", "title": "Data Structures and Algorithms", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        {"code": "CS 243", "title": "Operating Systems", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        {"code": "IS 245", "title": "Software Engineering I", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        {"code": "CS 274", "title": "Computer Networks", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        {"code": "ST 113", "title": "Basic Statistics", "credits": 12, "year": 2, "sem": 1, "status": "Elective"},
        # Y2 S2
        {"code": "CS 251", "title": "Design and Analysis of Algorithms", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "CS 282", "title": "Artificial Intelligence", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "IS 263", "title": "Database Systems II", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "CS 285", "title": "Mobile Application Development", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "CS 299", "title": "Practical Training (Computer Science)", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        # Y3 S1
        {"code": "CS 334", "title": "Computer Security and Cryptography", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        {"code": "CS 353", "title": "Distributed Systems", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        {"code": "CS 361", "title": "Compiler Design", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        {"code": "IS 335", "title": "Software Engineering II", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        {"code": "CS 371", "title": "Machine Learning", "credits": 12, "year": 3, "sem": 1, "status": "Elective"},
        # Y3 S2
        {"code": "CS 355", "title": "Cloud Computing", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
        {"code": "CS 372", "title": "Human-Computer Interaction", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
        {"code": "CS 381", "title": "Computer Graphics", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
        {"code": "CS 399", "title": "Final Year Computer Science Project", "credits": 16, "year": 3, "sem": 2, "status": "Core"},
    ],

    # 6. Bachelor of Commerce in Accounting (bcom-accounting) - UDBS
    "bcom-accounting": [
        {"code": "AC 100", "title": "Principles of Accounting I", "credits": 12, "year": 1, "sem": 1, "status": "Core"},
        {"code": "FN 100", "title": "Principles of Finance", "credits": 12, "year": 1, "sem": 1, "status": "Core"},
        {"code": "GM 100", "title": "Principles of Management", "credits": 12, "year": 1, "sem": 1, "status": "Core"},
        {"code": "DS 112", "title": "Development Perspectives I", "credits": 8, "year": 1, "sem": 1, "status": "Core"},
        {"code": "CL 106", "title": "Communication Skills", "credits": 8, "year": 1, "sem": 1, "status": "Core"},
        {"code": "AC 101", "title": "Principles of Accounting II", "credits": 12, "year": 1, "sem": 2, "status": "Core"},
        {"code": "MK 100", "title": "Principles of Marketing", "credits": 12, "year": 1, "sem": 2, "status": "Core"},
        {"code": "ST 113", "title": "Basic Statistics", "credits": 12, "year": 1, "sem": 2, "status": "Core"},
        {"code": "EC 116", "title": "Principles of Microeconomics I", "credits": 12, "year": 1, "sem": 2, "status": "Core"},
        {"code": "CS 101", "title": "Introduction to Computers and IT", "credits": 8, "year": 1, "sem": 2, "status": "Core"},
        {"code": "AC 200", "title": "Intermediate Financial Accounting I", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        {"code": "AC 201", "title": "Cost Accounting", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        {"code": "FN 200", "title": "Corporate Finance", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        {"code": "LW 100", "title": "Business Law", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        {"code": "AC 202", "title": "Intermediate Financial Accounting II", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "AC 203", "title": "Auditing Principles and Practice", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "FN 201", "title": "Financial Markets and Institutions", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "GM 200", "title": "Business Ethics and Governance", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "AC 300", "title": "Advanced Financial Accounting", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        {"code": "AC 301", "title": "Public Sector Accounting", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        {"code": "AC 302", "title": "Taxation I", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        {"code": "FN 300", "title": "Investment Analysis and Portfolio Management", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        {"code": "AC 303", "title": "Taxation II", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
        {"code": "AC 305", "title": "Forensic Accounting", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
        {"code": "AC 399", "title": "Research Project in Accounting", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
    ],

    # 7. Bachelor of Laws (llb) - UDSoL (4 years)
    "llb": [
        {"code": "AS 101", "title": "Legal Methods", "credits": 12, "year": 1, "sem": 1, "status": "Core"},
        {"code": "AS 102", "title": "Law of Contract I", "credits": 12, "year": 1, "sem": 1, "status": "Core"},
        {"code": "AS 103", "title": "Constitutional Law I", "credits": 12, "year": 1, "sem": 1, "status": "Core"},
        {"code": "DS 112", "title": "Development Perspectives I", "credits": 8, "year": 1, "sem": 1, "status": "Core"},
        {"code": "CL 106", "title": "Communication Skills", "credits": 8, "year": 1, "sem": 1, "status": "Core"},
        {"code": "AS 104", "title": "Law of Contract II", "credits": 12, "year": 1, "sem": 2, "status": "Core"},
        {"code": "AS 105", "title": "Constitutional Law II", "credits": 12, "year": 1, "sem": 2, "status": "Core"},
        {"code": "AS 106", "title": "Criminal Law and Procedure I", "credits": 12, "year": 1, "sem": 2, "status": "Core"},
        {"code": "AS 107", "title": "Torts I", "credits": 12, "year": 1, "sem": 2, "status": "Core"},
        {"code": "AS 201", "title": "Criminal Law and Procedure II", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        {"code": "AS 202", "title": "Torts II", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        {"code": "AS 203", "title": "Land Law I", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        {"code": "AS 204", "title": "Administrative Law", "credits": 12, "year": 2, "sem": 1, "status": "Core"},
        {"code": "AS 205", "title": "Land Law II", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "AS 206", "title": "Family Law", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "AS 207", "title": "Law of Evidence I", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "AS 208", "title": "Public International Law", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "AS 301", "title": "Law of Evidence II", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        {"code": "AS 302", "title": "Civil Procedure I", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        {"code": "AS 303", "title": "Commercial Law", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        {"code": "AS 304", "title": "Jurisprudence", "credits": 12, "year": 3, "sem": 1, "status": "Core"},
        {"code": "AS 305", "title": "Civil Procedure II", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
        {"code": "AS 306", "title": "Company Law", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
        {"code": "AS 307", "title": "Human Rights Law", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
        {"code": "AS 308", "title": "Labour Law", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
        {"code": "AS 401", "title": "Environmental Law", "credits": 12, "year": 4, "sem": 1, "status": "Core"},
        {"code": "AS 402", "title": "Intellectual Property Law", "credits": 12, "year": 4, "sem": 1, "status": "Core"},
        {"code": "AS 403", "title": "International Trade Law", "credits": 12, "year": 4, "sem": 1, "status": "Core"},
        {"code": "AS 404", "title": "Tax Law", "credits": 12, "year": 4, "sem": 1, "status": "Core"},
        {"code": "AS 405", "title": "Banking and Financial Services Law", "credits": 12, "year": 4, "sem": 2, "status": "Core"},
        {"code": "AS 406", "title": "Private International Law", "credits": 12, "year": 4, "sem": 2, "status": "Core"},
        {"code": "AS 499", "title": "LL.B Dissertation", "credits": 16, "year": 4, "sem": 2, "status": "Core"},
    ],

    # 8. Doctor of Medicine (doctor-medicine) - UDSM-MCHAS (5 years)
    "doctor-medicine": [
        {"code": "AN 100", "title": "Gross Anatomy and Histology I", "credits": 16, "year": 1, "sem": 1, "status": "Core"},
        {"code": "PH 100", "title": "Medical Physiology I", "credits": 14, "year": 1, "sem": 1, "status": "Core"},
        {"code": "BC 100", "title": "Medical Biochemistry I", "credits": 14, "year": 1, "sem": 1, "status": "Core"},
        {"code": "DS 112", "title": "Development Perspectives I", "credits": 8, "year": 1, "sem": 1, "status": "Core"},
        {"code": "AN 101", "title": "Gross Anatomy and Histology II & Embryology", "credits": 16, "year": 1, "sem": 2, "status": "Core"},
        {"code": "PH 101", "title": "Medical Physiology II", "credits": 14, "year": 1, "sem": 2, "status": "Core"},
        {"code": "BC 101", "title": "Medical Biochemistry II", "credits": 14, "year": 1, "sem": 2, "status": "Core"},
        {"code": "PA 200", "title": "General Pathology", "credits": 16, "year": 2, "sem": 1, "status": "Core"},
        {"code": "MC 200", "title": "Medical Microbiology and Immunology", "credits": 14, "year": 2, "sem": 1, "status": "Core"},
        {"code": "PR 200", "title": "Basic Pharmacology", "credits": 14, "year": 2, "sem": 1, "status": "Core"},
        {"code": "CM 200", "title": "Epidemiology and Biostatistics for Medicine", "credits": 10, "year": 2, "sem": 1, "status": "Core"},
        {"code": "PA 201", "title": "Systemic Pathology", "credits": 16, "year": 2, "sem": 2, "status": "Core"},
        {"code": "MC 201", "title": "Medical Parasitology and Entomology", "credits": 14, "year": 2, "sem": 2, "status": "Core"},
        {"code": "PR 201", "title": "Clinical Pharmacology", "credits": 14, "year": 2, "sem": 2, "status": "Core"},
        {"code": "IM 200", "title": "Introduction to Clinical Methods", "credits": 12, "year": 2, "sem": 2, "status": "Core"},
        {"code": "IM 300", "title": "Junior Internal Medicine Clerkship", "credits": 18, "year": 3, "sem": 1, "status": "Core"},
        {"code": "SG 300", "title": "Junior General Surgery Clerkship", "credits": 18, "year": 3, "sem": 1, "status": "Core"},
        {"code": "OG 300", "title": "Junior Obstetrics and Gynaecology Clerkship", "credits": 16, "year": 3, "sem": 1, "status": "Core"},
        {"code": "PD 300", "title": "Junior Paediatrics and Child Health Clerkship", "credits": 18, "year": 3, "sem": 2, "status": "Core"},
        {"code": "PS 300", "title": "Psychiatry and Mental Health", "credits": 14, "year": 3, "sem": 2, "status": "Core"},
        {"code": "OP 300", "title": "Ophthalmology and Otorhinolaryngology", "credits": 12, "year": 3, "sem": 2, "status": "Core"},
        {"code": "RT 300", "title": "Diagnostic Radiology and Imaging", "credits": 10, "year": 3, "sem": 2, "status": "Core"},
        {"code": "IM 400", "title": "Intermediate Internal Medicine Clerkship", "credits": 18, "year": 4, "sem": 1, "status": "Core"},
        {"code": "SG 400", "title": "Intermediate General and Orthopaedic Surgery", "credits": 18, "year": 4, "sem": 1, "status": "Core"},
        {"code": "OG 400", "title": "Intermediate Obstetrics and Gynaecology", "credits": 16, "year": 4, "sem": 1, "status": "Core"},
        {"code": "PD 400", "title": "Intermediate Paediatrics and Neonatology", "credits": 18, "year": 4, "sem": 2, "status": "Core"},
        {"code": "CM 400", "title": "Community Medicine and Primary Health Care", "credits": 16, "year": 4, "sem": 2, "status": "Core"},
        {"code": "EM 400", "title": "Emergency Medicine and Critical Care", "credits": 14, "year": 4, "sem": 2, "status": "Core"},
        {"code": "IM 500", "title": "Senior Internal Medicine Ward Clerkship", "credits": 20, "year": 5, "sem": 1, "status": "Core"},
        {"code": "SG 500", "title": "Senior Surgical Ward and Theatre Clerkship", "credits": 20, "year": 5, "sem": 1, "status": "Core"},
        {"code": "OG 500", "title": "Senior Obstetrics and Gynaecology Ward Clerkship", "credits": 20, "year": 5, "sem": 2, "status": "Core"},
        {"code": "PD 500", "title": "Senior Paediatrics Ward Clerkship", "credits": 20, "year": 5, "sem": 2, "status": "Core"},
        {"code": "MD 599", "title": "Medical Undergraduate Research Project", "credits": 16, "year": 5, "sem": 2, "status": "Core"},
    ]
}

print(f"Defined rich curriculum for {len(CURRICULUM)} representative programmes with {sum(len(c) for c in CURRICULUM.values())} courses.")
