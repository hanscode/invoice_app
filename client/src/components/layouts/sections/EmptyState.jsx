import PropTypes from "prop-types";

const EmptyState = ({ title, description, action, svg }) => {
  return (
    <div className="text-center py-12 mt-6 border rounded-lg dark:border-slate-700">
      {svg}
      <h2 className="mt-2 text-base font-semibold text-gray-900 dark:text-slate-300">
        {title}
      </h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-slate-300 dark:text-opacity-75">
        {description}
      </p>
      <div className="mt-6">
        {action}
      </div>
    </div>
  );
};

export default EmptyState;

EmptyState.propTypes = {
  title: PropTypes.string,
  description: PropTypes.object,
  action: PropTypes.node,
  svg: PropTypes.node,
};
