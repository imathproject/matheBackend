const UserService = require("../services/userService");
const UniversityService = require("../services/universityService");
const QuestionService = require("../services/questionService");
const MaterialService = require("../services/materialService");
const PublicDocumentService = require("../services/publicDocumentService");
const emailService = require("../services/emailService");
const QuestionAssessment = require("../services/questionAssessmentService");
const OlympicService = require("../services/OlympicService");
const UserModel = require("../models/userModel");
const AssessmentQuestions = require("../models/QuestionAssessmentModel");
const TestimonialService = require("../services/testimonialService");
const { tryCatch } = require("../utils/tryCatch");
const QuestionAssessmentService = require("../services/questionAssessmentService");
const fs = require("fs");
const path = require("path");

const findOutcomes = tryCatch(async (req, res) => {
  const students = await UserService.countStudents();
  const lecturers = await UserService.countLectures();
  const universities = await UniversityService.countUniversities();
  const questions = await QuestionService.countQuestions();
  const materials = await MaterialService.countMaterials();
  const videos = await MaterialService.countVideos();

  return res.status(200).json({
    elements: {
      labels: [
        "Students",
        "Lecturers",
        "Universities",
        "Questions",
        "Materials",
        "Videos",
      ],
      result: [
        students,
        lecturers,
        universities,
        questions,
        materials,
        videos,
      ],
    },
  });
});

const sendGetInTouch = tryCatch(async (req, res) => {
  await emailService.sendGetInTouchEmail(req.body);// { name, email, userSubject, userContent }
  return res.status(200).json({ elements: "Message sent" })
});

const getAllQuestionsInformation = tryCatch(async (req, res) => {
  const questions = await QuestionService.getAllQuestions();
  return res.status(200).json({ elements: questions });
});

const getHistoric = tryCatch(async (req, res) => {
  const result = await UserService.getHistoric();
  return res.status(200).json({ elements: result });
});

const getMapInformation = tryCatch(async (req, res) => {
  const uniCountries = await UniversityService.getCountries();
  //const studentsCountries = await UserService.usersCountries();
  //const countries = uniCountries.concat(studentsCountries);
  const uniMarkers = await UniversityService.getMarkers();
  const countriesInfo = await UniversityService.getInfo(uniCountries);

  return res.status(200).json({
    countries: uniCountries,
    uniMarkers: uniMarkers,
    countriesInfo: countriesInfo,
  });
});

// endpoint not available, func deprecated, was used to transition to newLevel system
const updateLevelById = tryCatch(async (req, res) => {
  const { ids, levels } = req.body;
  await QuestionService.updateLevelsInBulk(ids, levels);
  return res.status(200).json({ elements: "success" });
});

// endpoint not available, func deprecated, was used to transition to newLevel system
const updateAssessment = tryCatch(async (req, res) => {
  const { ids, levels } = req.body;
  await QuestionAssessmentService.updateLevelsInBulk(ids, levels);
  return res.status(200).json({ elements: "success" });
});

const downloadEurope = tryCatch(async (req, res) => {
  const filePath = PublicDocumentService.getEuropeDocumentPath();
  if (!filePath) return res.status(404).send("File not found");
  fs.createReadStream(filePath).pipe(res);
});

const downloadAssessment = tryCatch(async (req, res) => {
  const filePath = PublicDocumentService.getAssessmentDocumentPath();
  if (!filePath) return res.status(404).send("File not found");
  fs.createReadStream(filePath).pipe(res);
});

const downloadLibrary = tryCatch(async (req, res) => {
  const filePath = PublicDocumentService.getLibraryDocumentPath();
  if (!filePath) return res.status(404).send("File not found");
  fs.createReadStream(filePath).pipe(res);
});

const downloadDataProtection = tryCatch(async (req, res) => {
  const filePath = PublicDocumentService.getDataProtectionDocumentPath();
  if (!filePath) return res.status(404).send("File not found");
  fs.createReadStream(filePath).pipe(res);
});

const findValidatedTestimonials = tryCatch(async (req, res) => {
  const testimonials = await TestimonialService.getValidatedTestimonials();
  return res.status(200).json({ elements: testimonials });
});

const getTopics = tryCatch(async (req, res) => {
  const data = {
    "elements": [
      {
        "label": "Analytic Geometry",
        "id": 25,
        "icon": "TbVectorTriangle",
        "description": "Bases, Cartesian equations of a line, Cartesian equations of a plane, Collinearity, Cross product, Distance, Intersection, Locus, Magnitude of vectors, Orthogonal projection, Orthogonality, Projection, Relative position of vectors, Scalar product, Scalar triple product, Vector Operations"
      },
      {
        "label": "Complex Numbers",
        "id": 10,
        "icon": "TiInfoLarge",
        "description": "Algebraic form, Complex coefficients , Complex plane , Conjugate number, De Moivre formulas, Equations involving complex numbers, Exponential form, Imaginary part, Modulus of a complex number, Nth root, Operations with complex numbers, Powers of complex numbers, Principal argument, Real part, Regions in the complex plane, Trigonometric form"
      },
      {
        "label": "Differential Equations",
        "id": 16,
        "icon": "TbMath",
        "description": "Bernoulli equation, Cauchy problem, Characteristic equation, Constant coefficient ODE, Elimination method, Euler's method, Exact differential form, Homogeneous equation, Integral curve, Integral form, Integrating factor, Lagrange's method, Linear differential equation, Linear system, Parameters variation method, Reduction order method, Ricatti equation, Separable variables equation, Undetermined coefficient method, Wronskian"
      },
      {
        "id": 3,
        "id_top": 4,
        "label": "Derivatives",
        "hidden": 0,
        "icon": "TbMathMaxMin",
        "description": "Chain rule, Directional derivative, Exponential rule, Exponential rule, First order, Gradient, Hessian, Higher order, Logarithmic rule, More than two variable, One variable, Power rule, Power rule, Product rule, Quotient rule, Quotient rule, Second order, Second order, Sum rule, Tangent plane, Third order, Trigonometric rules, Trigonometric rules, Trigonometric rules, Two variables"
      },
      {
        "id": 42,
        "id_top": 4,
        "label": "Implicit Differentiation and Chain Rule",
        "hidden": 0,
        "icon": "FaLink",
        "description": "Chain rule, Directional derivative, Exponential rule, Exponential rule, First order, Gradient, Hessian, Higher order, Logarithmic rule, More than two variable, One variable, Power rule, Power rule, Product rule, Quotient rule, Quotient rule, Second order, Second order, Sum rule, Tangent plane, Third order, Trigonometric rules, Trigonometric rules, Trigonometric rules, Two variables"
      },
      {
        "id": 4,
        "id_top": 4,
        "label": "Partial Differentiation",
        "hidden": 0,
        "icon": "TbMathFunctionY",
        "description": "Chain rule, Directional derivative, Exponential rule, Exponential rule, First order, Gradient, Hessian, Higher order, Logarithmic rule, More than two variable, One variable, Power rule, Power rule, Product rule, Quotient rule, Quotient rule, Second order, Second order, Sum rule, Tangent plane, Third order, Trigonometric rules, Trigonometric rules, Trigonometric rules, Two variables"
      },
      {
        "id": 47,
        "id_top": 28,
        "label": "Recursivity",
        "hidden": 0,
        "icon": "FaRegSnowflake",
        "description": "Antisymmetric binary relation, Arithmetic sequence, Binary relation, Cardinality, Cartesian product, Closed formula, Complement of a set, Element of a set, Equivalence relation, Generating function, Geometric sequence, Homogeneous linear recurrences, Intersection of sets, Non-homogeneous linear recurrence, Patterns, Power set, Proper subset, Reflexive binary relation, Set, Set difference, Subset, Superset, Symmetric binary relation, Transitive binary relation, Union of sets, Venn diagram"
      },
      {
        "id": 46,
        "id_top": 28,
        "label": "Set Theory",
        "hidden": 0,
        "icon": "FaCode",
        "description": "Antisymmetric binary relation, Arithmetic sequence, Binary relation, Cardinality, Cartesian product, Closed formula, Complement of a set, Element of a set, Equivalence relation, Generating function, Geometric sequence, Homogeneous linear recurrences, Intersection of sets, Non-homogeneous linear recurrence, Patterns, Power set, Proper subset, Reflexive binary relation, Set, Set difference, Subset, Superset, Symmetric binary relation, Transitive binary relation, Union of sets, Venn diagram"
      },
      {
        "id": 2,
        "id_top": 7,
        "label": "Algebraic expressions, Equations, and Inequalities",
        "hidden": 0,
        "icon": "TiPiOutline",
        "description": "Absolute value, Angles, Classification of geometric solids, Classification of geometrical figures, Exponential function, Geometric solids, Geometric transformations, Geometrical figures, Inequations, Linear equations, Logarithmic function, Nonlinear equations, Perimeter, Platonic solids, Polygons, Polyhedrons, Quadratic equations, Quadrilaterals, Rearranging equations, Regular polygon, Rhombus, Root’s equation, Simplify expressions, Solution range, Square roots, Surface area, Symmetry, Triangle inequality, Triangles, Trigonometric functions"
      },
      {
        "id": 1,
        "id_top": 7,
        "label": "Elementary Geometry",
        "hidden": 0,
        "icon": "FiCodesandbox",
        "description": "Absolute value, Angles, Classification of geometric solids, Classification of geometrical figures, Exponential function, Geometric solids, Geometric transformations, Geometrical figures, Inequations, Linear equations, Logarithmic function, Nonlinear equations, Perimeter, Platonic solids, Polygons, Polyhedrons, Quadratic equations, Quadrilaterals, Rearranging equations, Regular polygon, Rhombus, Root’s equation, Simplify expressions, Solution range, Square roots, Surface area, Symmetry, Triangle inequality, Triangles, Trigonometric functions"

      },
      {
        "label": "Graph Theory",
        "id": 22,
        "icon": "SiSagemath",
        "description": "Adjacency matrix, Adjacent vertices, Bipartite graph, Chromatic number, Complement of a graph, Complete graph, Connectivity of a graph, Cycle and circuit, Dijkstra algorithm, Directed graph, Euler circuit, Euler's Formula, Eulerian graph, Hamiltonian graph, Incidence matrix , Isomorphic graphs, Kruskal algorithm, Path, Planar graph, Prim algorithm, Regular graph, Shortest path, Simple graph, Spanning tree, Subgraph, Tree, Weighted graph"
      },
      {
        "id": 44,
        "id_top": 5,
        "label": "Definite Integrals",
        "hidden": 0,
        "icon": "TbMathIntegral",
        "description": "Area , Area of a planar region , Area of a region between two or more curves, Cartesian coordinates, Changing order of integration, Closed surface, Cylindrical coordinates, Definition, Direct inspection, Direct integrals , Divergence theorem, Fundamental theorem of Calculus, Integration by parts,  Integration by parts, Integration over a box, Integration over a generic region, Iterate integrals, Open surface, Partial fractions decomposition, Polar coordinates, Power of trigonometric functions, Rational functions, Rectangular coordinates, Region decomposition, Region decomposition, Simple integration, Spherical coordinates, Stoke's theorem, Substitution, Substitution, Surface integral of a scalar function, Surface integral of a vector field, Trigonometric functions,  Trigonometric functions, Trigonometric identities, Trigonometric substitution, Trigonometric substitution, Triple integration, Volume, Volume of revolution, x-simple region (type II), y-simple region (type I)"

      },
      {
        "id": 6,
        "id_top": 5,
        "label": "Double Integration",
        "hidden": 0,
        "icon": "TbMathIntegrals",
        "description": "Area , Area of a planar region , Area of a region between two or more curves, Cartesian coordinates, Changing order of integration, Closed surface, Cylindrical coordinates, Definition, Direct inspection, Direct integrals , Divergence theorem, Fundamental theorem of Calculus, Integration by parts,  Integration by parts, Integration over a box, Integration over a generic region, Iterate integrals, Open surface, Partial fractions decomposition, Polar coordinates, Power of trigonometric functions, Rational functions, Rectangular coordinates, Region decomposition, Region decomposition, Simple integration, Spherical coordinates, Stoke's theorem, Substitution, Substitution, Surface integral of a scalar function, Surface integral of a vector field, Trigonometric functions,  Trigonometric functions, Trigonometric identities, Trigonometric substitution, Trigonometric substitution, Triple integration, Volume, Volume of revolution, x-simple region (type II), y-simple region (type I)"

      },
      {
        "id": 5,
        "id_top": 5,
        "label": "Integration Techniques",
        "hidden": 0,
        "icon": "TbMathIntegralX",
        "description": "Area , Area of a planar region , Area of a region between two or more curves, Cartesian coordinates, Changing order of integration, Closed surface, Cylindrical coordinates, Definition, Direct inspection, Direct integrals , Divergence theorem, Fundamental theorem of Calculus, Integration by parts,  Integration by parts, Integration over a box, Integration over a generic region, Iterate integrals, Open surface, Partial fractions decomposition, Polar coordinates, Power of trigonometric functions, Rational functions, Rectangular coordinates, Region decomposition, Region decomposition, Simple integration, Spherical coordinates, Stoke's theorem, Substitution, Substitution, Surface integral of a scalar function, Surface integral of a vector field, Trigonometric functions,  Trigonometric functions, Trigonometric identities, Trigonometric substitution, Trigonometric substitution, Triple integration, Volume, Volume of revolution, x-simple region (type II), y-simple region (type I)"

      },
      {
        "id": 53,
        "id_top": 5,
        "label": "Surface Integrals",
        "hidden": 0,
        "icon": "FiLayers",
        "description": "Area , Area of a planar region , Area of a region between two or more curves, Cartesian coordinates, Changing order of integration, Closed surface, Cylindrical coordinates, Definition, Direct inspection, Direct integrals , Divergence theorem, Fundamental theorem of Calculus, Integration by parts,  Integration by parts, Integration over a box, Integration over a generic region, Iterate integrals, Open surface, Partial fractions decomposition, Polar coordinates, Power of trigonometric functions, Rational functions, Rectangular coordinates, Region decomposition, Region decomposition, Simple integration, Spherical coordinates, Stoke's theorem, Substitution, Substitution, Surface integral of a scalar function, Surface integral of a vector field, Trigonometric functions,  Trigonometric functions, Trigonometric identities, Trigonometric substitution, Trigonometric substitution, Triple integration, Volume, Volume of revolution, x-simple region (type II), y-simple region (type I)"

      },
      {
        "id": 45,
        "id_top": 5,
        "label": "Triple Integration",
        "hidden": 0,
        "description": "Area , Area of a planar region , Area of a region between two or more curves, Cartesian coordinates, Changing order of integration, Closed surface, Cylindrical coordinates, Definition, Direct inspection, Direct integrals , Divergence theorem, Fundamental theorem of Calculus, Integration by parts,  Integration by parts, Integration over a box, Integration over a generic region, Iterate integrals, Open surface, Partial fractions decomposition, Polar coordinates, Power of trigonometric functions, Rational functions, Rectangular coordinates, Region decomposition, Region decomposition, Simple integration, Spherical coordinates, Stoke's theorem, Substitution, Substitution, Surface integral of a scalar function, Surface integral of a vector field, Trigonometric functions,  Trigonometric functions, Trigonometric identities, Trigonometric substitution, Trigonometric substitution, Triple integration, Volume, Volume of revolution, x-simple region (type II), y-simple region (type I)"

      },
      {
        "id": 8,
        "id_top": 18,
        "label": "Eigenvalues and Eigenvectors",
        "hidden": 0,
        "icon": "PiVectorThree",
        "description": "Basis, Change-of-basis matrix, Characteristic polynomial, Commuting matrices, Composition of linear transformations, Consistent system, Cramer linear system, Dependent system, Determinant, Determinant computation, Diagonalization, Diagonalization with orthonormal basis, Dimension, Eigenspace, Eigenvalues, Eigenvectors, Euclidean spaces, Hermitian matrix, Homogeneous system, Inconsistent system, Independent system, Injective linear transformation, Inverse matrix, Inverse of a matrix , Invertible linear transformation, Isomorphism, Kernel, Linear combination, Linear dependence, Linear independence, Linear system with parameters, Linear transformation, Linearity, Linearly independent rows, Matrix condensation, Matrix equation, Matrix multiplication, Matrix of a linear transformation, Matrix operations, Orthogonal basis, Orthonormal matrix, Power matrix,  Properties of the determinant, Range, Rank, Rank, Rotation, Rouché-Capelli theorem, Similar matrices, Solution of a linear system, Span, Spectral radius, Spectral shift, Spectrum, Square linear system, Square matrices, Symmetric matrix, Symmetric matrix, Trace of a matrix, Transpose, Undetermined linear system, Vector space, Vector subspace"
      },
      {
        "id": 9,
        "id_top": 18,
        "label": "Linear Systems",
        "hidden": 0,
        "icon": "FiList",
        "description": "Basis, Change-of-basis matrix, Characteristic polynomial, Commuting matrices, Composition of linear transformations, Consistent system, Cramer linear system, Dependent system, Determinant, Determinant computation, Diagonalization, Diagonalization with orthonormal basis, Dimension, Eigenspace, Eigenvalues, Eigenvectors, Euclidean spaces, Hermitian matrix, Homogeneous system, Inconsistent system, Independent system, Injective linear transformation, Inverse matrix, Inverse of a matrix , Invertible linear transformation, Isomorphism, Kernel, Linear combination, Linear dependence, Linear independence, Linear system with parameters, Linear transformation, Linearity, Linearly independent rows, Matrix condensation, Matrix equation, Matrix multiplication, Matrix of a linear transformation, Matrix operations, Orthogonal basis, Orthonormal matrix, Power matrix,  Properties of the determinant, Range, Rank, Rank, Rotation, Rouché-Capelli theorem, Similar matrices, Solution of a linear system, Span, Spectral radius, Spectral shift, Spectrum, Square linear system, Square matrices, Symmetric matrix, Symmetric matrix, Trace of a matrix, Transpose, Undetermined linear system, Vector space, Vector subspace"

      },
      {
        "id": 11,
        "id_top": 18,
        "label": "Linear Transformations",
        "hidden": 0,
        "icon": "FaUncharted",
        "description": "Basis, Change-of-basis matrix, Characteristic polynomial, Commuting matrices, Composition of linear transformations, Consistent system, Cramer linear system, Dependent system, Determinant, Determinant computation, Diagonalization, Diagonalization with orthonormal basis, Dimension, Eigenspace, Eigenvalues, Eigenvectors, Euclidean spaces, Hermitian matrix, Homogeneous system, Inconsistent system, Independent system, Injective linear transformation, Inverse matrix, Inverse of a matrix , Invertible linear transformation, Isomorphism, Kernel, Linear combination, Linear dependence, Linear independence, Linear system with parameters, Linear transformation, Linearity, Linearly independent rows, Matrix condensation, Matrix equation, Matrix multiplication, Matrix of a linear transformation, Matrix operations, Orthogonal basis, Orthonormal matrix, Power matrix,  Properties of the determinant, Range, Rank, Rank, Rotation, Rouché-Capelli theorem, Similar matrices, Solution of a linear system, Span, Spectral radius, Spectral shift, Spectrum, Square linear system, Square matrices, Symmetric matrix, Symmetric matrix, Trace of a matrix, Transpose, Undetermined linear system, Vector space, Vector subspace"

      },
      {
        "id": 7,
        "id_top": 18,
        "label": "Matrices and Determinants",
        "hidden": 0,
        "icon": "TbMatrix",
        "description": "Basis, Change-of-basis matrix, Characteristic polynomial, Commuting matrices, Composition of linear transformations, Consistent system, Cramer linear system, Dependent system, Determinant, Determinant computation, Diagonalization, Diagonalization with orthonormal basis, Dimension, Eigenspace, Eigenvalues, Eigenvectors, Euclidean spaces, Hermitian matrix, Homogeneous system, Inconsistent system, Independent system, Injective linear transformation, Inverse matrix, Inverse of a matrix , Invertible linear transformation, Isomorphism, Kernel, Linear combination, Linear dependence, Linear independence, Linear system with parameters, Linear transformation, Linearity, Linearly independent rows, Matrix condensation, Matrix equation, Matrix multiplication, Matrix of a linear transformation, Matrix operations, Orthogonal basis, Orthonormal matrix, Power matrix,  Properties of the determinant, Range, Rank, Rank, Rotation, Rouché-Capelli theorem, Similar matrices, Solution of a linear system, Span, Spectral radius, Spectral shift, Spectrum, Square linear system, Square matrices, Symmetric matrix, Symmetric matrix, Trace of a matrix, Transpose, Undetermined linear system, Vector space, Vector subspace"

      },
      {
        "id": 10,
        "id_top": 18,
        "label": "Vector Spaces",
        "hidden": 0,
        "icon": "FaHubspot",
        "description": "Basis, Change-of-basis matrix, Characteristic polynomial, Commuting matrices, Composition of linear transformations, Consistent system, Cramer linear system, Dependent system, Determinant, Determinant computation, Diagonalization, Diagonalization with orthonormal basis, Dimension, Eigenspace, Eigenvalues, Eigenvectors, Euclidean spaces, Hermitian matrix, Homogeneous system, Inconsistent system, Independent system, Injective linear transformation, Inverse matrix, Inverse of a matrix , Invertible linear transformation, Isomorphism, Kernel, Linear combination, Linear dependence, Linear independence, Linear system with parameters, Linear transformation, Linearity, Linearly independent rows, Matrix condensation, Matrix equation, Matrix multiplication, Matrix of a linear transformation, Matrix operations, Orthogonal basis, Orthonormal matrix, Power matrix,  Properties of the determinant, Range, Rank, Rank, Rotation, Rouché-Capelli theorem, Similar matrices, Solution of a linear system, Span, Spectral radius, Spectral shift, Spectrum, Square linear system, Square matrices, Symmetric matrix, Symmetric matrix, Trace of a matrix, Transpose, Undetermined linear system, Vector space, Vector subspace"

      },
      {
        "label": "Numerical Methods",
        "id": 26,
        "icon": "PiApproximateEqualsBold",
        "description": "Absolute error, Bisection method, Five points rule, Gauss-Seidel method, Jacobi method, Lagrange's interpolation, Least square method, Least squares method, Newton’s interpolation, Newton’s method, Nonlinear equation, Polynomial interpolation, Polynomial regression, Relative error, Secant method, Simpson's rule, Three points rule, Trapezoidal rule"

      },
      {
        "id": 12,
        "id_top": 12,
        "label": "Linear Optimization",
        "hidden": 0,
        "icon": "TbLine",
        "description": "Assignment problem, Constrained optimization, Constrained optimization, Duality theory, Excel solver add-in, Feasible set, Graphical method, Hungarian algorithm, KKT conditions, Lagrange multipliers, Linear programming, Maximizer, Maximizer, Maximum , Maximum, Minimizer, Minimizer, Minimum, Minimum, Minimum cost method, Northwest corner method, Optimal solution, Postoptimality analysis, Saddle point, Second derivative test, Sensitivity analysis, Simplex method, Stationary point, Transportation problem, Unconstrained optimization, Unconstrained optimization"

      },
      {
        "id": 13,
        "id_top": 12,
        "label": "Nonlinear Optimization",
        "hidden": 0,
        "icon": "FaRoute",
        "description": "Assignment problem, Constrained optimization, Constrained optimization, Duality theory, Excel solver add-in, Feasible set, Graphical method, Hungarian algorithm, KKT conditions, Lagrange multipliers, Linear programming, Maximizer, Maximizer, Maximum , Maximum, Minimizer, Minimizer, Minimum, Minimum, Minimum cost method, Northwest corner method, Optimal solution, Postoptimality analysis, Saddle point, Second derivative test, Sensitivity analysis, Simplex method, Stationary point, Transportation problem, Unconstrained optimization, Unconstrained optimization"

      },
      {
        "label": "Probability ",
        "id": 17,
        "icon": "FaArrowUpRightDots",
        "description": "Addition, multiplication, and total probability rules, Axioms of probability, Bayes' Theorem, Combinatorics, Conditional probability, Counting techniques, Event, Independence, Permutation, Random experiments, Random variables, Sample space"

      },
      {
        "id": 39,
        "id_top": 3,
        "label": "Domain, Image and Graphics of a Function of a Single Variable",
        "hidden": 0,
        "icon": "FaPencilRuler",
        "description": "Boundedness of a function, Codomain, Composition function, Continuity, Continuity of a function, Continuous function, Convergency, Definition and properties, Discontinuity, Divergency, Domain, Graphic representation, Hyperbolic functions, Image of a function, Indeterminate forms, Injectivity of a function, L'Hopital´s Rule, Limits, Logarithmic function, Monotonicity of a function, Parity of a function, Periodicity of a function, Polynomials, Roots of a function, Sign of a function, Surjectivity of a function, The Squeeze theorem, Trigonometric functions"

      },
      {
        "id": 37,
        "id_top": 3,
        "label": "Limits and Continuity of a Function of a Single Variable",
        "hidden": 0,
        "icon": "FaArrowsLeftRightToLine",
        "description": "Boundedness of a function, Codomain, Composition function, Continuity, Continuity of a function, Continuous function, Convergency, Definition and properties, Discontinuity, Divergency, Domain, Graphic representation, Hyperbolic functions, Image of a function, Indeterminate forms, Injectivity of a function, L'Hopital´s Rule, Limits, Logarithmic function, Monotonicity of a function, Parity of a function, Periodicity of a function, Polynomials, Roots of a function, Sign of a function, Surjectivity of a function, The Squeeze theorem, Trigonometric functions"

      },
      {
        "id": 41,
        "id_top": 15,
        "label": "Limits, Continuity, Domain and Image of Function of Several Variables",
        "hidden": 0,
        "icon": "FaArrowsUpToLine",
        "description": "Continuity, Continuity and Limit of function of several variables, Contour map, Critical Points, Derivatives, Domain, Domain of functions of several variables, Graph, Image, Level curve, Limits, Maximum of the function, Maximum Point, Minimum of the function, Minimum point, Saddle point, Stationary Points"

      },
      {
        "id": 39,
        "id_top": 3,
        "label": "Domain, Image and Graphics of Function of Several Variables",
        "hidden": 0,
        "icon": "HiOutlineCubeTransparent",
        "description": "Boundedness of a function, Codomain, Composition function, Continuity, Continuity of a function, Continuous function, Convergency, Definition and properties, Discontinuity, Divergency, Domain, Graphic representation, Hyperbolic functions, Image of a function, Indeterminate forms, Injectivity of a function, L'Hopital´s Rule, Limits, Logarithmic function, Monotonicity of a function, Parity of a function, Periodicity of a function, Polynomials, Roots of a function, Sign of a function, Surjectivity of a function, The Squeeze theorem, Trigonometric functions"

      },
      {
        "label": "Statistics",
        "id": 14,
        "icon": "FaRegChartBar",
        "description": "Chi square distribution, Confidence interval, Correlation, Data type, Frequency, Hypothesis testing, Interquartile range, Linear regression, Mean, Median, Mode, Non linear regression, Normal distribution, Outliers, Percentage, Point estimate, Population, Quantile, Randomness, Relative frequency, Sample, Significance level, Standard deviation, Stem and Leaf diagram, Student distribution, Variance"

      },
    ]
  }
  return res.status(200).json({ elements: data });
});

const getOlympics = tryCatch(async (req, res) => {
  const data = await OlympicService.getAllOlympics();
  return res.status(200).json({ elements: data });
});

const downloadOlympicImage = tryCatch(async (req, res) => {
  const { id, file_ext } = req.body;
  const filePath = path.join(
    __dirname,
    "../../olympiadsImage/" + id + "." + file_ext
  );
  if (fs.existsSync(filePath)) {
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } else {
    return res.status(404).send("File not found");
  }
});
module.exports = {
  findOutcomes,
  getAllQuestionsInformation,
  getHistoric,
  getMapInformation,
  updateLevelById,
  updateAssessment,
  downloadEurope,
  downloadAssessment,
  downloadLibrary,
  sendGetInTouch,
  findValidatedTestimonials,
  getTopics,
  getOlympics,
  downloadOlympicImage,
  downloadDataProtection
};
